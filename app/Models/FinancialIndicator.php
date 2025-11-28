<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FinancialIndicator extends Model
{
    use HasFactory;

    protected $table = 'financial_indicators';

    protected $guarded = ['id'];

    protected $casts = [
        // 公告日期
        'ann_date' => 'date',
        // 报告期截止日期
        'end_date' => 'date',
        // 基本每股收益
        'eps' => 'decimal:4',
        // 稀释每股收益
        'dt_eps' => 'decimal:4',
        // 每股营业总收入
        'total_revenue_ps' => 'decimal:4',
        // 每股营业收入
        'revenue_ps' => 'decimal:4',
        // 每股资本公积
        'capital_rese_ps' => 'decimal:4',
        // 每股盈余公积
        'surplus_rese_ps' => 'decimal:4',
        // 每股未分配利润
        'undist_profit_ps' => 'decimal:4',
        // 非经常性损益
        'extra_item' => 'decimal:4',
        // 扣除非经常损益后的净利润
        'profit_dedt' => 'decimal:4',
        // 销售毛利率
        'gross_margin' => 'decimal:4',
        // 流动比率
        'current_ratio' => 'decimal:4',
        // 速动比率
        'quick_ratio' => 'decimal:4',
        // 现金比率
        'cash_ratio' => 'decimal:4',
        // 应收账款周转率
        'ar_turn' => 'decimal:4',
        // 流动资产周转率
        'ca_turn' => 'decimal:4',
        // 固定资产周转率
        'fa_turn' => 'decimal:4',
        // 总资产周转率
        'assets_turn' => 'decimal:4',
        // 经营活动净收益
        'op_income' => 'decimal:4',
        // 息税前利润
        'ebit' => 'decimal:4',
        // 息税折旧摊销前利润
        'ebitda' => 'decimal:4',
        // 企业自由现金流量
        'fcff' => 'decimal:4',
        // 股权自由现金流量
        'fcfe' => 'decimal:4',
        // 流动负债合计
        'current_exint' => 'decimal:4',
        // 非流动负债合计
        'noncurrent_exint' => 'decimal:4',
        // 带息债务
        'interestdebt' => 'decimal:4',
        // 净债务
        'netdebt' => 'decimal:4',
        // 有形资产
        'tangible_asset' => 'decimal:4',
        // 营运资金
        'working_capital' => 'decimal:4',
        // 净营运资金
        'networking_capital' => 'decimal:4',
        // 投入资本
        'invest_capital' => 'decimal:4',
        // 留存收益
        'retained_earnings' => 'decimal:4',
        // 稀释每股收益2
        'diluted2_eps' => 'decimal:4',
        // 每股净资产
        'bps' => 'decimal:4',
        // 每股经营活动现金流量
        'ocfps' => 'decimal:4',
        // 每股留存收益
        'retainedps' => 'decimal:4',
        // 每股现金流量净额
        'cfps' => 'decimal:4',
        // 每股息税前利润
        'ebit_ps' => 'decimal:4',
        // 每股企业自由现金流量
        'fcff_ps' => 'decimal:4',
        // 每股股权自由现金流量
        'fcfe_ps' => 'decimal:4',
        // 销售净利率
        'netprofit_margin' => 'decimal:4',
        // 销售毛利率
        'grossprofit_margin' => 'decimal:4',
        // 销售成本率
        'cogs_of_sales' => 'decimal:4',
        // 销售期间费用率
        'expense_of_sales' => 'decimal:4',
        // 净利润/营业总收入
        'profit_to_gr' => 'decimal:4',
        // 销售费用/营业总收入
        'saleexp_to_gr' => 'decimal:4',
        // 管理费用/营业总收入
        'adminexp_of_gr' => 'decimal:4',
        // 财务费用/营业总收入
        'finaexp_of_gr' => 'decimal:4',
        // 资产减值损失
        'impai_ttm' => 'decimal:4',
        // 营业总成本/营业总收入
        'gc_of_gr' => 'decimal:4',
        // 营业利润/营业总收入
        'op_of_gr' => 'decimal:4',
        // 息税前利润/营业总收入
        'ebit_of_gr' => 'decimal:4',
        // 净资产收益率
        'roe' => 'decimal:4',
        // 加权平均净资产收益率
        'roe_waa' => 'decimal:4',
        // 净资产收益率(扣除非经常损益)
        'roe_dt' => 'decimal:4',
        // 总资产报酬率
        'roa' => 'decimal:4',
        // 总资产净利润
        'npta' => 'decimal:4',
        // 投入资本回报率
        'roic' => 'decimal:4',
        // 年化净资产收益率
        'roe_yearly' => 'decimal:4',
        // 年化总资产报酬率
        'roa2_yearly' => 'decimal:4',
        // 资产负债率
        'debt_to_assets' => 'decimal:4',
        // 权益乘数
        'assets_to_eqt' => 'decimal:4',
        // 权益乘数(杜邦分析)
        'dp_assets_to_eqt' => 'decimal:4',
        // 流动资产/总资产
        'ca_to_assets' => 'decimal:4',
        // 非流动资产/总资产
        'nca_to_assets' => 'decimal:4',
        // 有形资产/总资产
        'tbassets_to_totalassets' => 'decimal:4',
        // 带息债务/全部投入资本
        'int_to_talcap' => 'decimal:4',
        // 归属于母公司的股东权益/全部投入资本
        'eqt_to_talcapital' => 'decimal:4',
        // 流动负债/负债合计
        'currentdebt_to_debt' => 'decimal:4',
        // 非流动负债/负债合计
        'longdeb_to_debt' => 'decimal:4',
        // 经营活动产生的现金流量净额/流动负债
        'ocf_to_shortdebt' => 'decimal:4',
        // 产权比率
        'debt_to_eqt' => 'decimal:4',
        // 权益负债率
        'eqt_to_debt' => 'decimal:4',
        // 股东权益/带息债务
        'eqt_to_interestdebt' => 'decimal:4',
        // 有形资产/负债合计
        'tangibleasset_to_debt' => 'decimal:4',
        // 有形资产/带息债务
        'tangasset_to_intdebt' => 'decimal:4',
        // 有形资产/净债务
        'tangibleasset_to_netdebt' => 'decimal:4',
        // 经营活动产生的现金流量净额/负债合计
        'ocf_to_debt' => 'decimal:4',
        // 营业周期
        'turn_days' => 'decimal:4',
        // 年化总资产报酬率
        'roa_yearly' => 'decimal:4',
        // 总资产净利率(杜邦分析)
        'roa_dp' => 'decimal:4',
        // 固定资产
        'fixed_assets' => 'decimal:4',
        // 营业利润/利润总额
        'profit_to_op' => 'decimal:4',
        // 销售费用/营业总收入(单季度)
        'q_saleexp_to_gr' => 'decimal:4',
        // 营业总成本/营业总收入(单季度)
        'q_gc_to_gr' => 'decimal:4',
        // 净资产收益率(单季度)
        'q_roe' => 'decimal:4',
        // 净资产收益率(扣除非经常损益)(单季度)
        'q_dt_roe' => 'decimal:4',
        // 总资产净利润(单季度)
        'q_npta' => 'decimal:4',
        // 经营活动产生的现金流量净额/营业收入(单季度)
        'q_ocf_to_sales' => 'decimal:4',
        // 基本每股收益同比增长率
        'basic_eps_yoy' => 'decimal:4',
        // 稀释每股收益同比增长率
        'dt_eps_yoy' => 'decimal:4',
        // 每股经营活动产生的现金流量净额同比增长率
        'cfps_yoy' => 'decimal:4',
        // 营业利润同比增长率
        'op_yoy' => 'decimal:4',
        // 利润总额同比增长率
        'ebt_yoy' => 'decimal:4',
        // 归属母公司股东的净利润同比增长率
        'netprofit_yoy' => 'decimal:4',
        // 归属母公司股东的净利润-扣除非经常损益同比增长率
        'dt_netprofit_yoy' => 'decimal:4',
        // 经营活动产生的现金流量净额同比增长率
        'ocf_yoy' => 'decimal:4',
        // 净资产收益率(摊薄)同比增长率
        'roe_yoy' => 'decimal:4',
        // 每股净资产相对年初增长率
        'bps_yoy' => 'decimal:4',
        // 资产总计相对年初增长率
        'assets_yoy' => 'decimal:4',
        // 归属母公司的股东权益相对年初增长率
        'eqt_yoy' => 'decimal:4',
        // 营业总收入同比增长率
        'tr_yoy' => 'decimal:4',
        // 营业收入同比增长率
        'or_yoy' => 'decimal:4',
        // 营业收入同比增长率(单季度)
        'q_sales_yoy' => 'decimal:4',
        // 营业利润环比增长率
        'q_op_qoq' => 'decimal:4',
        // 净资产同比增长率
        'equity_yoy' => 'decimal:4',
    ];

    /**
     * 获取所属股票
     */
    public function stock(): BelongsTo
    {
        return $this->belongsTo(Stock::class);
    }

    /**
     * 获取报告期显示名称
     */
    public function getReportPeriodNameAttribute(): string
    {
        return match($this->report_period) {
            'quarter' => '季度',
            'annual' => '年度',
            default => '未知',
        };
    }

    /**
     * 获取ROE百分比显示
     */
    public function getRoePercentAttribute(): string
    {
        return number_format($this->roe * 100, 2) . '%';
    }

    /**
     * 获取毛利率百分比显示
     */
    public function getGrossMarginPercentAttribute(): string
    {
        return number_format($this->gross_margin * 100, 2) . '%';
    }

    /**
     * 获取净利率百分比显示
     */
    public function getNetMarginPercentAttribute(): string
    {
        return number_format($this->net_margin * 100, 2) . '%';
    }

    /**
     * 获取股息率百分比显示
     */
    public function getDividendYieldPercentAttribute(): string
    {
        return number_format($this->dividend_yield * 100, 2) . '%';
    }
}
