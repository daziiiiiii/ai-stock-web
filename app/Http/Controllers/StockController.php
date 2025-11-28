<?php

namespace App\Http\Controllers;

use App\Models\Stock;
use App\Models\FinancialData;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class StockController extends Controller
{
    public function index()
    {
        // 简单的列表页逻辑
        return Inertia::render('Stocks/Index', [
            'stocks' => Stock::paginate(20)
        ]);
    }

    public function show($symbol)
    {
        $stock = Stock::where('symbol', $symbol)->firstOrFail();

        // 1. 获取财务数据 - 结合income、fina_indicator和cashflow类型数据
        $incomeData = FinancialData::where('stock_id', $stock->id)
            ->where('data_type', 'income')
            ->orderBy('end_date', 'desc')
            ->get()
            ->keyBy('end_date');

        $finaIndicatorData = FinancialData::where('stock_id', $stock->id)
            ->where('data_type', 'fina_indicator')
            ->orderBy('end_date', 'desc')
            ->get()
            ->keyBy('end_date');

        $cashflowData = FinancialData::where('stock_id', $stock->id)
            ->where('data_type', 'cashflow')
            ->orderBy('end_date', 'desc')
            ->get()
            ->keyBy('end_date');

        // 合并数据
        $financials = collect();
        $reportDates = $incomeData->keys()
            ->merge($finaIndicatorData->keys())
            ->merge($cashflowData->keys())
            ->unique()
            ->sortDesc();

        foreach ($reportDates as $reportDate) {
            $incomeRecord = $incomeData->get($reportDate);
            $finaRecord = $finaIndicatorData->get($reportDate);
            $cashflowRecord = $cashflowData->get($reportDate);

            // 从JSON数据中提取现金流数据
            $cashflowJson = $cashflowRecord ? $cashflowRecord->data : null;
            $operatingCashFlow = $cashflowJson ? ($cashflowJson['n_cashflow_act'] ?? null) : null;
            $investingCashFlow = $cashflowJson ? ($cashflowJson['n_cashflow_inv_act'] ?? null) : null;
            $financingCashFlow = $cashflowJson ? ($cashflowJson['n_cash_flows_fnc_act'] ?? null) : null;

            $combinedRecord = [
                'report_date' => $reportDate,
                'report_period' => $incomeRecord ? $incomeRecord->report_period : ($finaRecord ? $finaRecord->report_period : ($cashflowRecord ? $cashflowRecord->report_period : 'annual')),
                // 从income类型获取的绝对数值
                'revenue' => $incomeRecord ? $incomeRecord->revenue : null,
                'net_income' => $incomeRecord ? $incomeRecord->net_income : null,
                'gross_profit' => $incomeRecord ? $incomeRecord->gross_profit : null,
                'oper_cost' => $incomeRecord ? $incomeRecord->oper_cost : null, // 营业成本
                'sell_exp' => $incomeRecord ? $incomeRecord->sell_exp : null, // 销售费用
                'admin_exp' => $incomeRecord ? $incomeRecord->admin_exp : null, // 管理费用
                'fin_exp' => $incomeRecord ? $incomeRecord->fin_exp : null, // 财务费用
                'total_profit' => $incomeRecord ? $incomeRecord->total_profit : null, // 利润总额
                // 从cashflow类型获取现金流数据
                'operating_cash_flow' => $operatingCashFlow,
                'investing_cash_flow' => $investingCashFlow,
                'financing_cash_flow' => $financingCashFlow,
                // 从fina_indicator类型获取的比率指标
                'gross_margin' => $finaRecord ? $finaRecord->gross_margin : null,
                'net_margin' => $finaRecord ? $finaRecord->net_margin : null,
                'roe' => $finaRecord ? $finaRecord->roe : null,
                'roa' => $finaRecord ? $finaRecord->roa : null,
                'debt_ratio' => $finaRecord ? $finaRecord->debt_ratio : null,
                'current_ratio' => $finaRecord ? $finaRecord->current_ratio : null,
                'quick_ratio' => $finaRecord ? $finaRecord->quick_ratio : null,
                'cash_ratio' => $finaRecord ? $finaRecord->cash_ratio : null, // 现金比率
                'eps' => $finaRecord ? $finaRecord->eps : null,
                'pe_ratio' => $finaRecord ? $finaRecord->pe_ratio : null,
                'pb_ratio' => $finaRecord ? $finaRecord->pb_ratio : null,
                'ps_ratio' => $finaRecord ? $finaRecord->ps_ratio : null,
                'dividend_yield' => $finaRecord ? $finaRecord->dividend_yield : null,
                'peg_ratio' => $finaRecord ? $finaRecord->peg_ratio : null,
                // 新增营运能力指标
                'assets_turn' => $finaRecord ? $finaRecord->assets_turn : null, // 总资产周转率
                'ar_turn' => $finaRecord ? $finaRecord->ar_turn : null, // 应收账款周转率
                'ca_turn' => $finaRecord ? $finaRecord->ca_turn : null, // 流动资产周转率
                'fa_turn' => $finaRecord ? $finaRecord->fa_turn : null, // 固定资产周转率
                // 新增成长能力指标
                'revenue_yoy' => $finaRecord ? $finaRecord->or_yoy : null, // 营业收入同比增长率
                'net_income_yoy' => $finaRecord ? $finaRecord->netprofit_yoy : null, // 净利润同比增长率
                // 新增杜邦分析指标
                'equity_multiplier' => $finaRecord ? $finaRecord->assets_to_eqt : null, // 权益乘数
                'asset_turnover' => $finaRecord ? $finaRecord->assets_turn : null, // 资产周转率
                'profit_margin' => $finaRecord ? $finaRecord->net_margin : null, // 净利率
                // 新增现金流质量指标
                'ocf_to_or' => $finaRecord ? $finaRecord->ocf_to_or : null, // 经营活动现金流/营业收入
                'ocf_to_profit' => $finaRecord ? $finaRecord->ocf_to_profit : null, // 经营活动现金流/营业利润
                'cash_flow_adequacy' => $this->calculateCashFlowAdequacy($incomeRecord, $finaRecord, $operatingCashFlow, $investingCashFlow), // 现金流充足性
            ];

            // 计算财务健康度评分
            $healthScore = $this->calculateHealthScore($combinedRecord);
            $combinedRecord['financial_health_score'] = $healthScore['score'];
            $combinedRecord['financial_health_grade'] = $healthScore['grade'];

            $financials->push($combinedRecord);
        }

        $financials = $financials
            ->filter(function ($item) {
                // 过滤掉所有关键字段都为null的记录
                return !empty($item['revenue']) || !empty($item['net_income']) || !empty($item['roe']);
            })
            ->values()
            ->take(20); // 只取最近20期

        // 2. 模拟实时数据 (实际项目中应从API获取)
        $realtime = [
            'symbol' => $stock->symbol,
            'name' => $stock->name,
            'open' => 10.2,
            'high' => 10.8,
            'low' => 10.1,
            'close' => 10.5,
            'prev_close' => 10.0,
            'change' => 0.5,
            'change_percent' => 5.0,
            'volume' => 1000000,
            'amount' => 10500000,
        ];

        // 3. 模拟历史数据 (实际项目中应从数据库获取)
        $historical = [];
        for ($i = 0; $i < 30; $i++) {
            $date = now()->subDays($i)->format('Y-m-d');
            $basePrice = 10 + sin($i) * 2;
            $historical[] = [
                'date' => $date,
                'open' => $basePrice,
                'close' => $basePrice + rand(-5, 5) / 10,
                'high' => $basePrice + 0.5,
                'low' => $basePrice - 0.5,
                'volume' => rand(500000, 2000000),
                'change' => rand(-20, 20) / 100,
                'change_percent' => rand(-200, 200) / 100,
            ];
        }

        return Inertia::render('Stocks/Show', [
            'stock' => $stock,
            'realtime' => $realtime,
            'financials' => $financials,
            'historical' => $historical,
            'indicators' => null,
            'remaining_queries' => 100,
            'daily_limit' => 100,
            '_timestamp' => now()->timestamp, // 添加时间戳强制刷新
        ]);
    }

    private function formatReportPeriod($date)
    {
        try {
            $carbonDate = Carbon::parse($date);
            $month = $carbonDate->month;
            $year = $carbonDate->year;
            
            if ($month == 3) return "{$year}一季报";
            if ($month == 6) return "{$year}中报";
            if ($month == 9) return "{$year}三季报";
            if ($month == 12) return "{$year}年报";
            return $date;
        } catch (\Exception $e) {
            return $date;
        }
    }

    private function calculateHealthScore($data)
    {
        $score = 60; // 基础分
        
        // 盈利能力
        if (($data['roe'] ?? 0) > 0.15) $score += 10;
        if (($data['gross_margin'] ?? 0) > 0.30) $score += 5;
        if (($data['net_margin'] ?? 0) > 0.10) $score += 5;
        
        // 偿债能力
        if (($data['debt_ratio'] ?? 0) < 0.60) $score += 5;
        if (($data['current_ratio'] ?? 0) > 1.5) $score += 5;
        
        // 现金流
        if (($data['operating_cash_flow'] ?? 0) > 0) $score += 10;

        // 成长能力
        if (($data['revenue_yoy'] ?? 0) > 0.10) $score += 5;
        if (($data['net_income_yoy'] ?? 0) > 0.10) $score += 5;

        // 营运能力
        if (($data['assets_turn'] ?? 0) > 0.5) $score += 5;
        if (($data['ar_turn'] ?? 0) > 6) $score += 5;

        // 评级
        $grade = 'B';
        if ($score >= 90) $grade = 'A+';
        elseif ($score >= 80) $grade = 'A';
        elseif ($score >= 70) $grade = 'B+';
        elseif ($score >= 60) $grade = 'B';
        elseif ($score >= 50) $grade = 'C';
        else $grade = 'D';

        return ['score' => $score, 'grade' => $grade];
    }

    private function calculateCashFlowAdequacy($incomeRecord, $finaRecord)
    {
        if (!$incomeRecord || !$finaRecord) {
            return null;
        }

        $score = 0;
        
        // 经营现金流为正
        if ($incomeRecord->operating_cash_flow > 0) {
            $score += 30;
        }
        
        // 经营现金流大于净利润
        if ($incomeRecord->operating_cash_flow > $incomeRecord->net_income) {
            $score += 30;
        }
        
        // 自由现金流为正
        $freeCashFlow = $incomeRecord->operating_cash_flow + $incomeRecord->investing_cash_flow;
        if ($freeCashFlow > 0) {
            $score += 20;
        }
        
        // 现金流覆盖利息
        if ($finaRecord->ocf_to_interestdebt && $finaRecord->ocf_to_interestdebt > 1) {
            $score += 20;
        }

        return $score;
    }

    private function getDuPontAnalysis($financials)
    {
        if (empty($financials)) {
            return null;
        }

        $latest = $financials[0];
        
        return [
            'roe' => $latest['roe'] ?? null,
            'profit_margin' => $latest['profit_margin'] ?? null,
            'asset_turnover' => $latest['asset_turnover'] ?? null,
            'equity_multiplier' => $latest['equity_multiplier'] ?? null,
            'calculated_roe' => ($latest['profit_margin'] ?? 0) * ($latest['asset_turnover'] ?? 0) * ($latest['equity_multiplier'] ?? 0)
        ];
    }
}
