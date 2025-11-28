<?php

namespace App\Http\Controllers;

use App\Models\Stock;
use App\Models\FinancialData;
use App\Models\UsageRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class FinancialAnalysisController extends Controller
{
    /**
     * 财务分析页面
     */
    public function index(Request $request)
    {
        $query = Stock::query()->with(['latestFinancial']);

        // 基本筛选
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('symbol', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%");
            });
        }

        if ($request->has('market') && $request->market) {
            $query->where('market', $request->market);
        }

        if ($request->has('industry') && $request->industry) {
            $query->where('industry', $request->industry);
        }

        // 财务指标筛选
        $query->whereHas('latestFinancial', function ($q) use ($request) {
            // ROE筛选
            if ($request->has('min_roe') && $request->min_roe > 0) {
                $q->where('roe', '>=', $request->min_roe / 100);
            }
            if ($request->has('max_roe') && $request->max_roe < 50) {
                $q->where('roe', '<=', $request->max_roe / 100);
            }

            // 毛利率筛选
            if ($request->has('min_gross_margin') && $request->min_gross_margin > 0) {
                $q->where('gross_margin', '>=', $request->min_gross_margin / 100);
            }
            if ($request->has('max_gross_margin') && $request->max_gross_margin < 100) {
                $q->where('gross_margin', '<=', $request->max_gross_margin / 100);
            }

            // PE比率筛选
            if ($request->has('min_pe_ratio') && $request->min_pe_ratio > 0) {
                $q->where('pe_ratio', '>=', $request->min_pe_ratio);
            }
            if ($request->has('max_pe_ratio') && $request->max_pe_ratio < 100) {
                $q->where('pe_ratio', '<=', $request->max_pe_ratio);
            }

            // PB比率筛选
            if ($request->has('min_pb_ratio') && $request->min_pb_ratio > 0) {
                $q->where('pb_ratio', '>=', $request->min_pb_ratio);
            }
            if ($request->has('max_pb_ratio') && $request->max_pb_ratio < 10) {
                $q->where('pb_ratio', '<=', $request->max_pb_ratio);
            }

            // 财务健康度筛选
            if ($request->has('financial_health') && $request->financial_health) {
                $q->where('financial_health_grade', $request->financial_health);
            }
        });

        $stocks = $query->orderBy('symbol')->limit(100)->get();

        return inertia('FinancialAnalysis/Index', [
            'stocks' => $stocks,
            'filters' => $request->all(),
            'remaining_queries' => 9999, // 设置为很大的数值表示无限制
            'daily_limit' => 9999, // 设置为很大的数值表示无限制
        ]);
    }

    /**
     * 获取财务指标趋势分析
     */
    public function trendAnalysis(Request $request, string $symbol)
    {
        $stock = Stock::where('symbol', $symbol)->first();

        if (!$stock) {
            return response()->json([
                'error' => '股票不存在'
            ], 404);
        }

        // 获取最近8期的财务数据
        $financialData = FinancialData::where('stock_id', $stock->id)
            ->orderBy('report_date', 'desc')
            ->limit(8)
            ->get();

        // 计算趋势
        $trends = [];
        if ($financialData->count() > 1) {
            $latest = $financialData->first();
            $previous = $financialData->skip(1)->first();

            $trends = [
                'revenue' => $this->calculateTrend($latest->revenue, $previous->revenue),
                'net_income' => $this->calculateTrend($latest->net_income, $previous->net_income),
                'gross_margin' => $this->calculateTrend($latest->gross_margin, $previous->gross_margin),
                'roe' => $this->calculateTrend($latest->roe, $previous->roe),
                'debt_ratio' => $this->calculateTrend($latest->debt_ratio, $previous->debt_ratio),
            ];
        }

        return response()->json([
            'data' => [
                'financial_data' => $financialData,
                'trends' => $trends,
            ]
        ]);
    }

    /**
     * 行业对比分析
     */
    public function industryComparison(Request $request)
    {
        $industry = $request->get('industry');
        $metric = $request->get('metric', 'roe');

        if (!$industry) {
            return response()->json([
                'error' => '请选择行业'
            ], 400);
        }

        // 获取行业内的股票财务数据
        $industryData = FinancialData::select([
                'financial_data.*',
                'stocks.symbol',
                'stocks.name',
                'stocks.industry'
            ])
            ->join('stocks', 'financial_data.stock_id', '=', 'stocks.id')
            ->where('stocks.industry', $industry)
            ->where('financial_data.report_date', function ($query) {
                $query->select('report_date')
                    ->from('financial_data as fd2')
                    ->whereColumn('fd2.stock_id', 'financial_data.stock_id')
                    ->orderBy('report_date', 'desc')
                    ->limit(1);
            })
            ->orderBy("financial_data.{$metric}", 'desc')
            ->limit(20)
            ->get();

        // 计算行业平均值
        $average = $industryData->avg($metric);
        $median = $this->calculateMedian($industryData->pluck($metric)->toArray());

        return response()->json([
            'data' => [
                'industry_data' => $industryData,
                'statistics' => [
                    'average' => $average,
                    'median' => $median,
                    'count' => $industryData->count(),
                ]
            ]
        ]);
    }

    /**
     * 财务健康度评估
     */
    public function financialHealth(Request $request, string $symbol)
    {
        $stock = Stock::where('symbol', $symbol)->first();

        if (!$stock) {
            return response()->json([
                'error' => '股票不存在'
            ], 404);
        }

        // 获取最新财务数据
        $financialData = FinancialData::where('stock_id', $stock->id)
            ->orderBy('report_date', 'desc')
            ->first();

        if (!$financialData) {
            return response()->json([
                'error' => '暂无财务数据'
            ], 404);
        }

        // 计算财务健康度详细评分
        $healthScore = $this->calculateDetailedHealthScore($financialData);

        return response()->json([
            'data' => [
                'health_score' => $healthScore,
                'financial_data' => $financialData,
            ]
        ]);
    }

    /**
     * 计算趋势百分比
     */
    private function calculateTrend($current, $previous)
    {
        if ($previous == 0) {
            return $current > 0 ? 100 : 0;
        }

        return (($current - $previous) / abs($previous)) * 100;
    }

    /**
     * 计算中位数
     */
    private function calculateMedian($array)
    {
        sort($array);
        $count = count($array);
        
        if ($count == 0) return 0;
        if ($count % 2) {
            return $array[floor($count / 2)];
        } else {
            return ($array[($count / 2) - 1] + $array[$count / 2]) / 2;
        }
    }

    /**
     * 计算详细财务健康度评分
     */
    private function calculateDetailedHealthScore($financialData)
    {
        $scores = [];

        // 盈利能力评分 (40%)
        $profitabilityScore = $this->calculateProfitabilityScore($financialData);
        $scores['profitability'] = $profitabilityScore;

        // 偿债能力评分 (30%)
        $solvencyScore = $this->calculateSolvencyScore($financialData);
        $scores['solvency'] = $solvencyScore;

        // 运营效率评分 (20%)
        $efficiencyScore = $this->calculateEfficiencyScore($financialData);
        $scores['efficiency'] = $efficiencyScore;

        // 成长性评分 (10%)
        $growthScore = $this->calculateGrowthScore($financialData);
        $scores['growth'] = $growthScore;

        // 加权总分
        $totalScore = (
            $profitabilityScore * 0.4 +
            $solvencyScore * 0.3 +
            $efficiencyScore * 0.2 +
            $growthScore * 0.1
        );

        return [
            'total_score' => round($totalScore, 1),
            'breakdown' => $scores,
            'grade' => $this->getHealthGrade($totalScore),
        ];
    }

    /**
     * 计算盈利能力评分
     */
    private function calculateProfitabilityScore($data)
    {
        $score = 0;

        // ROE评分
        if ($data->roe >= 0.15) $score += 30;
        elseif ($data->roe >= 0.10) $score += 20;
        elseif ($data->roe >= 0.05) $score += 10;

        // 毛利率评分
        if ($data->gross_margin >= 0.4) $score += 30;
        elseif ($data->gross_margin >= 0.3) $score += 20;
        elseif ($data->gross_margin >= 0.2) $score += 10;

        // 净利率评分
        if ($data->net_margin >= 0.15) $score += 40;
        elseif ($data->net_margin >= 0.10) $score += 30;
        elseif ($data->net_margin >= 0.05) $score += 20;
        elseif ($data->net_margin >= 0) $score += 10;

        return min($score, 100);
    }

    /**
     * 计算偿债能力评分
     */
    private function calculateSolvencyScore($data)
    {
        $score = 0;

        // 负债率评分 (越低越好)
        if ($data->debt_ratio <= 0.4) $score += 40;
        elseif ($data->debt_ratio <= 0.6) $score += 30;
        elseif ($data->debt_ratio <= 0.8) $score += 20;

        // 流动比率评分
        if ($data->current_ratio >= 2) $score += 30;
        elseif ($data->current_ratio >= 1.5) $score += 20;
        elseif ($data->current_ratio >= 1) $score += 10;

        // 速动比率评分
        if ($data->quick_ratio >= 1.5) $score += 30;
        elseif ($data->quick_ratio >= 1) $score += 20;
        elseif ($data->quick_ratio >= 0.5) $score += 10;

        return min($score, 100);
    }

    /**
     * 计算运营效率评分
     */
    private function calculateEfficiencyScore($data)
    {
        // 这里可以根据总资产周转率等指标计算
        // 暂时使用ROA作为替代指标
        $score = 0;

        if ($data->roa >= 0.08) $score = 100;
        elseif ($data->roa >= 0.05) $score = 80;
        elseif ($data->roa >= 0.03) $score = 60;
        elseif ($data->roa >= 0) $score = 40;

        return $score;
    }

    /**
     * 计算成长性评分
     */
    private function calculateGrowthScore($data)
    {
        // 这里需要历史数据来计算增长率
        // 暂时给一个基础分数
        return 60;
    }

    /**
     * 获取健康度等级
     */
    private function getHealthGrade($score)
    {
        if ($score >= 85) return '优秀';
        if ($score >= 70) return '良好';
        if ($score >= 50) return '一般';
        return '较差';
    }

    /**
     * 检查使用额度
     */
    private function checkUsageLimit(Request $request, string $endpoint): bool
    {
        $userId = Auth::id();
        $ipAddress = $request->ip();

        $limit = $this->getDailyLimit($request);
        return !UsageRecord::isOverDailyLimit($ipAddress, $userId, $limit);
    }

    /**
     * 获取每日限额
     */
    private function getDailyLimit(Request $request): int
    {
        $userId = Auth::id();
        return $userId ? Auth::user()->daily_query_limit : 3;
    }

    /**
     * 获取剩余查询次数
     */
    private function getRemainingQueries(Request $request): int
    {
        $userId = Auth::id();
        $ipAddress = $request->ip();
        $limit = $this->getDailyLimit($request);

        return UsageRecord::getRemainingQueries($ipAddress, $userId, $limit);
    }

    /**
     * 记录使用情况
     */
    private function recordUsage(Request $request, string $endpoint, string $resource): void
    {
        $userId = Auth::id();
        $ipAddress = $request->ip();

        UsageRecord::recordUsage($ipAddress, $userId, $resource, $endpoint);
    }
}
