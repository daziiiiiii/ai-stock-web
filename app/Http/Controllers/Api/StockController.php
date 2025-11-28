<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Stock;
use App\Services\StockDataService;
use App\Models\UsageRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class StockController extends Controller
{
    private $stockDataService;

    public function __construct(StockDataService $stockDataService)
    {
        $this->stockDataService = $stockDataService;
    }

    /**
     * 获取股票列表
     */
    public function index(Request $request)
    {
        $query = Stock::query();

        // 搜索过滤
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('symbol', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%");
            });
        }

        // 市场过滤
        if ($request->has('market') && $request->market) {
            $query->where('market', $request->market);
        }

        // 行业过滤
        if ($request->has('industry') && $request->industry) {
            $query->where('industry', $request->industry);
        }

        // 状态过滤
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $stocks = $query->orderBy('symbol')
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'data' => $stocks->items(),
            'meta' => [
                'current_page' => $stocks->currentPage(),
                'last_page' => $stocks->lastPage(),
                'per_page' => $stocks->perPage(),
                'total' => $stocks->total(),
            ]
        ]);
    }

    /**
     * 获取股票详情
     */
    public function show(Request $request, string $symbol)
    {
        $stock = Stock::where('symbol', $symbol)->first();

        if (!$stock) {
            return response()->json([
                'error' => '股票不存在'
            ], 404);
        }

        // 获取实时数据
        $realtimeData = $this->stockDataService->getRealtimeData($symbol);

        return response()->json([
            'data' => [
                'stock' => $stock,
                'realtime' => $realtimeData,
            ]
        ]);
    }

    /**
     * 获取股票历史数据
     */
    public function history(Request $request, string $symbol)
    {
        $period = $request->get('period', 'day');
        $limit = $request->get('limit', 100);

        $historicalData = $this->stockDataService->getHistoricalData($symbol, $period, $limit);

        return response()->json([
            'data' => $historicalData
        ]);
    }

    /**
     * 获取财务数据
     */
    public function financials(Request $request, string $symbol)
    {
        $period = $request->get('period', 'quarter');
        $limit = $request->get('limit', 8);

        $financialData = $this->stockDataService->getFinancialData($symbol, $period, $limit);

        return response()->json([
            'data' => $financialData
        ]);
    }

    /**
     * 获取技术指标
     */
    public function indicators(Request $request, string $symbol)
    {
        $indicators = $request->get('indicators', ['ma', 'macd']);
        $period = $request->get('period', 'day');
        $limit = $request->get('limit', 100);

        // 获取历史数据
        $historicalData = $this->stockDataService->getHistoricalData($symbol, $period, $limit);

        // 计算技术指标
        $technicalIndicators = $this->stockDataService->calculateTechnicalIndicators($historicalData, $indicators);

        return response()->json([
            'data' => [
                'historical' => $historicalData,
                'indicators' => $technicalIndicators,
            ]
        ]);
    }

    /**
     * 获取行业对比数据
     */
    public function industryComparison(Request $request, string $symbol)
    {
        $stock = Stock::where('symbol', $symbol)->first();

        if (!$stock) {
            return response()->json([
                'error' => '股票不存在'
            ], 404);
        }

        // 获取同行业股票
        $industryStocks = Stock::where('industry', $stock->industry)
            ->where('id', '!=', $stock->id)
            ->limit(10)
            ->get();

        // 获取当前股票的财务数据
        $currentFinancial = $this->stockDataService->getFinancialData($symbol, 'quarter', 1);
        $currentData = !empty($currentFinancial) ? $currentFinancial[0] : null;

        // 计算行业平均值
        $industryData = [];
        if ($currentData) {
            $industryData = [
                'pe_ratio' => $this->calculateIndustryAverage($industryStocks, 'pe_ratio'),
                'pb_ratio' => $this->calculateIndustryAverage($industryStocks, 'pb_ratio'),
                'roe' => $this->calculateIndustryAverage($industryStocks, 'roe'),
                'gross_margin' => $this->calculateIndustryAverage($industryStocks, 'gross_margin'),
            ];
        }

        return response()->json([
            'data' => [
                'current_stock' => [
                    'symbol' => $stock->symbol,
                    'name' => $stock->name,
                    'pe_ratio' => $currentData['pe_ratio'] ?? null,
                    'pb_ratio' => $currentData['pb_ratio'] ?? null,
                    'roe' => $currentData['roe'] ?? null,
                    'gross_margin' => $currentData['gross_margin'] ?? null,
                ],
                'industry_average' => $industryData,
                'competitors' => $industryStocks->map(function ($competitor) {
                    return [
                        'symbol' => $competitor->symbol,
                        'name' => $competitor->name,
                    ];
                }),
            ]
        ]);
    }

    /**
     * 检查使用额度
     */
    private function checkUsageLimit(Request $request, string $endpoint): bool
    {
        $userId = Auth::id();
        $ipAddress = $request->ip();

        // 获取用户或IP的每日限额
        $limit = $userId ? Auth::user()->daily_query_limit : 3;

        // 检查是否超过限额
        return !UsageRecord::isOverDailyLimit($ipAddress, $userId, $limit);
    }

    /**
     * 记录使用情况
     */
    private function recordUsage(Request $request, string $endpoint, string $stockSymbol): void
    {
        $userId = Auth::id();
        $ipAddress = $request->ip();

        UsageRecord::recordUsage($ipAddress, $userId, $stockSymbol, $endpoint);
    }

    /**
     * 计算行业平均值
     */
    private function calculateIndustryAverage($stocks, string $field): float
    {
        $total = 0;
        $count = 0;

        foreach ($stocks as $stock) {
            $financialData = $this->stockDataService->getFinancialData($stock->symbol, 'quarter', 1);
            if (!empty($financialData)) {
                $value = $financialData[0][$field] ?? null;
                if ($value !== null) {
                    $total += $value;
                    $count++;
                }
            }
        }

        return $count > 0 ? round($total / $count, 4) : 0;
    }

    /**
     * 获取剩余查询次数
     */
    public function remainingQueries(Request $request)
    {
        $userId = Auth::id();
        $ipAddress = $request->ip();

        $limit = $userId ? Auth::user()->daily_query_limit : 3;
        $remaining = UsageRecord::getRemainingQueries($ipAddress, $userId, $limit);

        return response()->json([
            'data' => [
                'remaining_queries' => $remaining,
                'daily_limit' => $limit,
                'user_type' => $userId ? 'registered' : 'anonymous',
            ]
        ]);
    }
}
