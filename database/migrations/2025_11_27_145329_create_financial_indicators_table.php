<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('financial_indicators', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_id')->constrained()->onDelete('cascade');
            
            $table->date('report_date');
            $table->enum('report_period', ['quarter', 'annual'])->default('quarter');

            $table->date('ann_date')->nullable()->comment('公告日期');
            $table->date('end_date')->nullable()->comment('报告期');
            $table->decimal('eps', 8, 4)->nullable()->comment('每股收益');
            $table->decimal('dt_eps', 8, 4)->nullable()->comment('稀释每股收益');
            $table->decimal('total_revenue_ps', 8, 4)->nullable()->comment('每股营业总收入');
            $table->decimal('revenue_ps', 8, 4)->nullable()->comment('每股营业收入');
            $table->decimal('capital_rese_ps', 8, 4)->nullable()->comment('每股资本公积');
            $table->decimal('surplus_rese_ps', 8, 4)->nullable()->comment('每股盈余公积');
            $table->decimal('undist_profit_ps', 8, 4)->nullable()->comment('每股未分配利润');
            $table->decimal('extra_item', 8, 4)->nullable()->comment('非经常性损益');
            $table->decimal('profit_dedt', 8, 4)->nullable()->comment('扣除非经常性损益后的净利润');
            $table->decimal('gross_margin', 8, 4)->nullable()->comment('毛利率');
            $table->decimal('current_ratio', 8, 4)->nullable()->comment('流动比率');
            $table->decimal('quick_ratio', 8, 4)->nullable()->comment('速动比率');
            $table->decimal('cash_ratio', 8, 4)->nullable()->comment('现金比率');
            $table->decimal('ar_turn', 8, 4)->nullable()->comment('应收账款周转率');
            $table->decimal('ca_turn', 8, 4)->nullable()->comment('流动资产周转率');
            $table->decimal('fa_turn', 8, 4)->nullable()->comment('固定资产周转率');
            $table->decimal('assets_turn', 8, 4)->nullable()->comment('总资产周转率');
            $table->decimal('op_income', 8, 4)->nullable()->comment('经营活动净收益');
            $table->decimal('ebit', 8, 4)->nullable()->comment('息税前利润');
            $table->decimal('ebitda', 8, 4)->nullable()->comment('息税折旧摊销前利润');
            $table->decimal('fcff', 8, 4)->nullable()->comment('企业自由现金流量');
            $table->decimal('fcfe', 8, 4)->nullable()->comment('股权自由现金流量');
            $table->decimal('current_exint', 8, 4)->nullable()->comment('流动负债合计');
            $table->decimal('noncurrent_exint', 8, 4)->nullable()->comment('非流动负债合计');
            $table->decimal('interestdebt', 8, 4)->nullable()->comment('带息债务');
            $table->decimal('netdebt', 8, 4)->nullable()->comment('净债务');
            $table->decimal('tangible_asset', 8, 4)->nullable()->comment('有形资产');
            $table->decimal('working_capital', 8, 4)->nullable()->comment('营运资金');
            $table->decimal('networking_capital', 8, 4)->nullable()->comment('净营运资金');
            $table->decimal('invest_capital', 8, 4)->nullable()->comment('投入资本');
            $table->decimal('retained_earnings', 8, 4)->nullable()->comment('留存收益');
            $table->decimal('diluted2_eps', 8, 4)->nullable()->comment('稀释每股收益2');
            $table->decimal('bps', 8, 4)->nullable()->comment('每股净资产');
            $table->decimal('ocfps', 8, 4)->nullable()->comment('每股经营活动产生的现金流量净额');
            $table->decimal('retainedps', 8, 4)->nullable()->comment('每股留存收益');
            $table->decimal('cfps', 8, 4)->nullable()->comment('每股现金流量净额');
            $table->decimal('ebit_ps', 8, 4)->nullable()->comment('每股息税前利润');
            $table->decimal('fcff_ps', 8, 4)->nullable()->comment('每股企业自由现金流量');
            $table->decimal('fcfe_ps', 8, 4)->nullable()->comment('每股股权自由现金流量');
            $table->decimal('netprofit_margin', 8, 4)->nullable()->comment('销售净利率');
            $table->decimal('grossprofit_margin', 8, 4)->nullable()->comment('销售毛利率');
            $table->decimal('cogs_of_sales', 8, 4)->nullable()->comment('销售成本率');
            $table->decimal('expense_of_sales', 8, 4)->nullable()->comment('销售期间费用率');
            $table->decimal('profit_to_gr', 8, 4)->nullable()->comment('净利润/营业总收入');
            $table->decimal('saleexp_to_gr', 8, 4)->nullable()->comment('销售费用/营业总收入');
            $table->decimal('adminexp_of_gr', 8, 4)->nullable()->comment('管理费用/营业总收入');
            $table->decimal('finaexp_of_gr', 8, 4)->nullable()->comment('财务费用/营业总收入');
            $table->decimal('impai_ttm', 8, 4)->nullable()->comment('资产减值损失');
            $table->decimal('gc_of_gr', 8, 4)->nullable()->comment('营业总成本/营业总收入');
            $table->decimal('op_of_gr', 8, 4)->nullable()->comment('营业利润/营业总收入');
            $table->decimal('ebit_of_gr', 8, 4)->nullable()->comment('息税前利润/营业总收入');
            $table->decimal('roe', 8, 4)->nullable()->comment('净资产收益率');
            $table->decimal('roe_waa', 8, 4)->nullable()->comment('加权平均净资产收益率');
            $table->decimal('roe_dt', 8, 4)->nullable()->comment('净资产收益率(扣除非经常损益)');
            $table->decimal('roa', 8, 4)->nullable()->comment('总资产报酬率');
            $table->decimal('npta', 8, 4)->nullable()->comment('总资产净利润');
            $table->decimal('roic', 8, 4)->nullable()->comment('投入资本回报率');
            $table->decimal('roe_yearly', 8, 4)->nullable()->comment('年化净资产收益率');
            $table->decimal('roa2_yearly', 8, 4)->nullable()->comment('年化总资产报酬率');
            $table->decimal('debt_to_assets', 8, 4)->nullable()->comment('资产负债率');
            $table->decimal('assets_to_eqt', 8, 4)->nullable()->comment('权益乘数');
            $table->decimal('dp_assets_to_eqt', 8, 4)->nullable()->comment('权益乘数(杜邦分析)');
            $table->decimal('ca_to_assets', 8, 4)->nullable()->comment('流动资产/总资产');
            $table->decimal('nca_to_assets', 8, 4)->nullable()->comment('非流动资产/总资产');
            $table->decimal('tbassets_to_totalassets', 8, 4)->nullable()->comment('有形资产/总资产');
            $table->decimal('int_to_talcap', 8, 4)->nullable()->comment('带息债务/全部投入资本');
            $table->decimal('eqt_to_talcapital', 8, 4)->nullable()->comment('归属于母公司的股东权益/全部投入资本');
            $table->decimal('currentdebt_to_debt', 8, 4)->nullable()->comment('流动负债/负债合计');
            $table->decimal('longdeb_to_debt', 8, 4)->nullable()->comment('非流动负债/负债合计');
            $table->decimal('ocf_to_shortdebt', 8, 4)->nullable()->comment('经营活动产生的现金流量净额/流动负债');
            $table->decimal('debt_to_eqt', 8, 4)->nullable()->comment('产权比率');
            $table->decimal('eqt_to_debt', 8, 4)->nullable()->comment('归属于母公司的股东权益/负债合计');
            $table->decimal('eqt_to_interestdebt', 8, 4)->nullable()->comment('归属于母公司的股东权益/带息债务');
            $table->decimal('tangibleasset_to_debt', 8, 4)->nullable()->comment('有形资产/负债合计');
            $table->decimal('tangasset_to_intdebt', 8, 4)->nullable()->comment('有形资产/带息债务');
            $table->decimal('tangibleasset_to_netdebt', 8, 4)->nullable()->comment('有形资产/净债务');
            $table->decimal('ocf_to_debt', 8, 4)->nullable()->comment('经营活动产生的现金流量净额/负债合计');
            $table->decimal('turn_days', 8, 4)->nullable()->comment('营业周期');
            $table->decimal('roa_yearly', 8, 4)->nullable()->comment('年化总资产报酬率');
            $table->decimal('roa_dp', 8, 4)->nullable()->comment('总资产净利率(杜邦分析)');
            $table->decimal('fixed_assets', 8, 4)->nullable()->comment('固定资产合计');
            $table->decimal('profit_to_op', 8, 4)->nullable()->comment('利润总额/营业收入');
            $table->decimal('q_saleexp_to_gr', 8, 4)->nullable()->comment('销售费用/营业总收入(单季度)');
            $table->decimal('q_gc_to_gr', 8, 4)->nullable()->comment('营业总成本/营业总收入(单季度)');
            $table->decimal('q_roe', 8, 4)->nullable()->comment('净资产收益率(单季度)');
            $table->decimal('q_dt_roe', 8, 4)->nullable()->comment('净资产收益率(扣除非经常损益)(单季度)');
            $table->decimal('q_npta', 8, 4)->nullable()->comment('总资产净利润(单季度)');
            $table->decimal('q_ocf_to_sales', 8, 4)->nullable()->comment('经营活动产生的现金流量净额/营业收入(单季度)');
            $table->decimal('basic_eps_yoy', 8, 4)->nullable()->comment('基本每股收益同比增长率');
            $table->decimal('dt_eps_yoy', 8, 4)->nullable()->comment('稀释每股收益同比增长率');
            $table->decimal('cfps_yoy', 8, 4)->nullable()->comment('每股经营活动产生的现金流量净额同比增长率');
            $table->decimal('op_yoy', 8, 4)->nullable()->comment('营业利润同比增长率');
            $table->decimal('ebt_yoy', 8, 4)->nullable()->comment('利润总额同比增长率');
            $table->decimal('netprofit_yoy', 8, 4)->nullable()->comment('归属母公司股东的净利润同比增长率');
            $table->decimal('dt_netprofit_yoy', 8, 4)->nullable()->comment('归属母公司股东的净利润-扣除非经常损益同比增长率');
            $table->decimal('ocf_yoy', 8, 4)->nullable()->comment('经营活动产生的现金流量净额同比增长率');
            $table->decimal('roe_yoy', 8, 4)->nullable()->comment('净资产收益率(摊薄)同比增长率');
            $table->decimal('bps_yoy', 8, 4)->nullable()->comment('每股净资产相对年初增长率');
            $table->decimal('assets_yoy', 8, 4)->nullable()->comment('资产总计相对年初增长率');
            $table->decimal('eqt_yoy', 8, 4)->nullable()->comment('归属母公司的股东权益相对年初增长率');
            $table->decimal('tr_yoy', 8, 4)->nullable()->comment('营业总收入同比增长率');
            $table->decimal('or_yoy', 8, 4)->nullable()->comment('营业收入同比增长率');
            $table->decimal('q_sales_yoy', 8, 4)->nullable()->comment('营业总收入同比增长率(单季度)');
            $table->decimal('q_op_qoq', 8, 4)->nullable()->comment('营业利润环比增长率(单季度)');
            $table->decimal('equity_yoy', 8, 4)->nullable()->comment('净资产同比增长率');
            $table->json('data')->nullable()->comment('原始数据');
            $table->timestamps();

            // 索引
            $table->index(['stock_id', 'report_date']);
            $table->index('report_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('financial_indicators');
    }
};
