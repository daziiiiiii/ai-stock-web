<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IncomeStatement extends Model
{
    use HasFactory;

    protected $table = 'income_statements';

    protected $guarded = ['id'];

    protected $casts = [
        // 报告日期
        'report_date' => 'date',
        // 营业收入
        'revenue' => 'decimal:2',
        // 净利润
        'net_income' => 'decimal:2',
        // 毛利润
        'gross_profit' => 'decimal:2',
        // 营业成本
        'oper_cost' => 'decimal:2',
        // 销售费用
        'sell_exp' => 'decimal:2',
        // 管理费用
        'admin_exp' => 'decimal:2',
        // 财务费用
        'fin_exp' => 'decimal:2',
        // 利润总额
        'total_profit' => 'decimal:2',
        // 毛利率
        'gross_margin' => 'decimal:4',
        // 净利率
        'net_margin' => 'decimal:4',
        // 每股收益
        'eps' => 'decimal:4',
        // 原始数据
        'data' => 'array',
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
     * 获取营业收入格式化显示
     */
    public function getRevenueFormattedAttribute(): string
    {
        if ($this->revenue >= 100000000) {
            return number_format($this->revenue / 100000000, 2) . '亿元';
        } elseif ($this->revenue >= 10000) {
            return number_format($this->revenue / 10000, 2) . '万元';
        }
        return number_format($this->revenue, 2) . '元';
    }

    /**
     * 获取净利润格式化显示
     */
    public function getNetIncomeFormattedAttribute(): string
    {
        if ($this->net_income >= 100000000) {
            return number_format($this->net_income / 100000000, 2) . '亿元';
        } elseif ($this->net_income >= 10000) {
            return number_format($this->net_income / 10000, 2) . '万元';
        }
        return number_format($this->net_income, 2) . '元';
    }

    /**
     * 获取毛利率百分比显示
     */
    public function getGrossMarginPercentAttribute(): string
    {
        return number_format($this->gross_margin , 2) . '%';
    }

    /**
     * 获取净利率百分比显示
     */
    public function getNetMarginPercentAttribute(): string
    {
        return number_format($this->net_margin , 2) . '%';
    }
}
