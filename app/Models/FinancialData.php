<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FinancialData extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'report_date' => 'date',
        'ann_date' => 'date',
        'data' => 'array',
        'revenue' => 'decimal:2',
        'net_income' => 'decimal:2',
        'gross_profit' => 'decimal:2',
        'gross_margin' => 'decimal:4',
        'net_margin' => 'decimal:4',
        'roe' => 'decimal:4',
        'roa' => 'decimal:4',
        'debt_ratio' => 'decimal:4',
        'current_ratio' => 'decimal:4',
        'quick_ratio' => 'decimal:4',
        'eps' => 'decimal:4',
        'pe_ratio' => 'decimal:4',
        'pb_ratio' => 'decimal:4',
        'ps_ratio' => 'decimal:4',
        'dividend_yield' => 'decimal:4',
        'peg_ratio' => 'decimal:4',
        'operating_cash_flow' => 'decimal:2',
        'investing_cash_flow' => 'decimal:2',
        'financing_cash_flow' => 'decimal:2',
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
     * 获取ROE百分比显示
     */
    public function getRoePercentAttribute(): string
    {
        return number_format($this->roe * 100, 2) . '%';
    }

    /**
     * 获取股息率百分比显示
     */
    public function getDividendYieldPercentAttribute(): string
    {
        return number_format($this->dividend_yield * 100, 2) . '%';
    }

    /**
     * 获取财务健康度评分
     */
    public function getFinancialHealthScoreAttribute(): int
    {
        $score = 0;

        // ROE评分
        if ($this->roe >= 0.15) $score += 3;
        elseif ($this->roe >= 0.10) $score += 2;
        elseif ($this->roe >= 0.05) $score += 1;

        // 毛利率评分
        if ($this->gross_margin >= 0.4) $score += 3;
        elseif ($this->gross_margin >= 0.3) $score += 2;
        elseif ($this->gross_margin >= 0.2) $score += 1;

        // 负债率评分
        if ($this->debt_ratio <= 0.4) $score += 3;
        elseif ($this->debt_ratio <= 0.6) $score += 2;
        elseif ($this->debt_ratio <= 0.8) $score += 1;

        // 流动比率评分
        if ($this->current_ratio >= 2) $score += 3;
        elseif ($this->current_ratio >= 1.5) $score += 2;
        elseif ($this->current_ratio >= 1) $score += 1;

        return $score;
    }

    /**
     * 获取财务健康度等级
     */
    public function getFinancialHealthGradeAttribute(): string
    {
        $score = $this->financial_health_score;

        if ($score >= 10) return '优秀';
        if ($score >= 7) return '良好';
        if ($score >= 4) return '一般';
        return '较差';
    }
}
