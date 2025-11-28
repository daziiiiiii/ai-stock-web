<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Stock extends Model
{
    use HasFactory;

    protected $fillable = [
        'symbol',
        'name',
        'market',
        'industry',
        'list_date',
        'status',
    ];

    protected $casts = [
        'list_date' => 'date',
    ];

    /**
     * 获取股票的日线数据
     */
    public function dailyData(): HasMany
    {
        return $this->hasMany(StockDailyData::class);
    }

    /**
     * 获取股票的财务数据 (旧表，用于兼容)
     */
    public function financialData(): HasMany
    {
        return $this->hasMany(FinancialData::class);
    }

    /**
     * 获取股票的利润表数据
     */
    public function incomeStatements(): HasMany
    {
        return $this->hasMany(IncomeStatement::class);
    }

    /**
     * 获取股票的财务指标数据
     */
    public function financialIndicators(): HasMany
    {
        return $this->hasMany(FinancialIndicator::class);
    }

    /**
     * 获取股票的现金流量表数据
     */
    public function cashFlows(): HasMany
    {
        return $this->hasMany(CashFlow::class);
    }

    /**
     * 获取股票的资产负债表数据
     */
    public function balanceSheets(): HasMany
    {
        return $this->hasMany(BalanceSheet::class);
    }

    /**
     * 获取股票的技术指标
     */
    public function technicalIndicators(): HasMany
    {
        return $this->hasMany(TechnicalIndicator::class);
    }

    /**
     * 获取包含该股票的自选股
     */
    public function watchlists(): HasMany
    {
        return $this->hasMany(Watchlist::class);
    }

    /**
     * 获取包含该股票的投资组合持仓
     */
    public function portfolioHoldings(): HasMany
    {
        return $this->hasMany(PortfolioHolding::class);
    }

    /**
     * 获取最近交易日的日线数据
     */
    public function getLatestDailyDataAttribute()
    {
        return $this->dailyData()->latest('date')->first();
    }

    /**
     * 获取最近财务报告期的财务数据
     */
    public function getLatestFinancialDataAttribute()
    {
        return $this->financialData()->latest('report_date')->first();
    }

    /**
     * 获取最新的财务数据（关系方法）
     */
    public function latestFinancial()
    {
        return $this->hasOne(FinancialData::class)->latest('report_date');
    }

    /**
     * 根据市场类型获取显示名称
     */
    public function getMarketNameAttribute(): string
    {
        return match($this->market) {
            'SH' => '上海证券交易所',
            'SZ' => '深圳证券交易所',
            'HK' => '香港交易所',
            'US' => '美国交易所',
            default => '未知市场',
        };
    }

    /**
     * 获取完整的股票代码显示
     */
    public function getFullSymbolAttribute(): string
    {
        return match($this->market) {
            'SH' => $this->symbol . '.SH',
            'SZ' => $this->symbol . '.SZ',
            'HK' => $this->symbol . '.HK',
            'US' => $this->symbol,
            default => $this->symbol,
        };
    }
}
