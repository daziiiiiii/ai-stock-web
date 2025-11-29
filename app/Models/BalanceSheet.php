<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BalanceSheet extends Model
{
    use HasFactory;

    protected $table = 'balance_sheets';

    protected $guarded = ['id'];

    protected $casts = [
        // 报告日期
        'report_date' => 'date',
        // 总资产
        'total_assets' => 'decimal:2',
        // 总负债
        'total_liabilities' => 'decimal:2',
        // 股东权益
        'equity' => 'decimal:2',
        // 流动资产
        'current_assets' => 'decimal:2',
        // 非流动资产
        'non_current_assets' => 'decimal:2',
        // 流动负债
        'current_liabilities' => 'decimal:2',
        // 非流动负债
        'non_current_liabilities' => 'decimal:2',
        // 负债率
        'debt_ratio' => 'decimal:4',
        // 流动比率
        'current_ratio' => 'decimal:4',
        // 速动比率
        'quick_ratio' => 'decimal:4',
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
     * 获取总资产格式化显示
     */
    public function getTotalAssetsFormattedAttribute(): string
    {
        if ($this->total_assets >= 100000000) {
            return number_format($this->total_assets / 100000000, 2) . '亿元';
        } elseif ($this->total_assets >= 10000) {
            return number_format($this->total_assets / 10000, 2) . '万元';
        }
        return number_format($this->total_assets, 2) . '元';
    }

    /**
     * 获取总负债格式化显示
     */
    public function getTotalLiabilitiesFormattedAttribute(): string
    {
        if ($this->total_liabilities >= 100000000) {
            return number_format($this->total_liabilities / 100000000, 2) . '亿元';
        } elseif ($this->total_liabilities >= 10000) {
            return number_format($this->total_liabilities / 10000, 2) . '万元';
        }
        return number_format($this->total_liabilities, 2) . '元';
    }

    /**
     * 获取股东权益格式化显示
     */
    public function getEquityFormattedAttribute(): string
    {
        if ($this->equity >= 100000000) {
            return number_format($this->equity / 100000000, 2) . '亿元';
        } elseif ($this->equity >= 10000) {
            return number_format($this->equity / 10000, 2) . '万元';
        }
        return number_format($this->equity, 2) . '元';
    }

    /**
     * 获取负债率百分比显示
     */
    public function getDebtRatioPercentAttribute(): string
    {
        return number_format($this->debt_ratio , 2) . '%';
    }
}
