<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CashFlow extends Model
{
    use HasFactory;

    protected $table = 'cash_flows';

    protected $guarded = ['id'];

    protected $casts = [
        // 报告日期
        'report_date' => 'date',
        // 经营活动现金流
        'operating_cash_flow' => 'decimal:2',
        // 投资活动现金流
        'investing_cash_flow' => 'decimal:2',
        // 筹资活动现金流
        'financing_cash_flow' => 'decimal:2',
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
     * 获取经营活动现金流格式化显示
     */
    public function getOperatingCashFlowFormattedAttribute(): string
    {
        if ($this->operating_cash_flow >= 100000000) {
            return number_format($this->operating_cash_flow / 100000000, 2) . '亿元';
        } elseif ($this->operating_cash_flow >= 10000) {
            return number_format($this->operating_cash_flow / 10000, 2) . '万元';
        }
        return number_format($this->operating_cash_flow, 2) . '元';
    }

    /**
     * 获取投资活动现金流格式化显示
     */
    public function getInvestingCashFlowFormattedAttribute(): string
    {
        if ($this->investing_cash_flow >= 100000000) {
            return number_format($this->investing_cash_flow / 100000000, 2) . '亿元';
        } elseif ($this->investing_cash_flow >= 10000) {
            return number_format($this->investing_cash_flow / 10000, 2) . '万元';
        }
        return number_format($this->investing_cash_flow, 2) . '元';
    }

    /**
     * 获取筹资活动现金流格式化显示
     */
    public function getFinancingCashFlowFormattedAttribute(): string
    {
        if ($this->financing_cash_flow >= 100000000) {
            return number_format($this->financing_cash_flow / 100000000, 2) . '亿元';
        } elseif ($this->financing_cash_flow >= 10000) {
            return number_format($this->financing_cash_flow / 10000, 2) . '万元';
        }
        return number_format($this->financing_cash_flow, 2) . '元';
    }
}
