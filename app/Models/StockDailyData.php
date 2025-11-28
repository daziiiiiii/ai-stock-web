<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockDailyData extends Model
{
    use HasFactory;

    protected $fillable = [
        'stock_id',
        'date',
        'open',
        'high',
        'low',
        'close',
        'volume',
        'amount',
        'change',
        'change_percent',
    ];

    protected $casts = [
        'date' => 'date',
        'open' => 'decimal:4',
        'high' => 'decimal:4',
        'low' => 'decimal:4',
        'close' => 'decimal:4',
        'volume' => 'integer',
        'amount' => 'decimal:2',
        'change' => 'decimal:4',
        'change_percent' => 'decimal:4',
    ];

    /**
     * 获取所属股票
     */
    public function stock(): BelongsTo
    {
        return $this->belongsTo(Stock::class);
    }

    /**
     * 获取涨跌幅颜色类
     */
    public function getChangeColorClassAttribute(): string
    {
        if ($this->change_percent > 0) {
            return 'text-red-500'; // 红色表示上涨
        } elseif ($this->change_percent < 0) {
            return 'text-green-500'; // 绿色表示下跌
        }
        return 'text-gray-500'; // 灰色表示平盘
    }

    /**
     * 获取涨跌幅显示文本
     */
    public function getChangeDisplayAttribute(): string
    {
        if ($this->change_percent > 0) {
            return '+' . number_format($this->change_percent, 2) . '%';
        } elseif ($this->change_percent < 0) {
            return number_format($this->change_percent, 2) . '%';
        }
        return '0.00%';
    }

    /**
     * 获取成交额格式化显示
     */
    public function getAmountFormattedAttribute(): string
    {
        if ($this->amount >= 100000000) {
            return number_format($this->amount / 100000000, 2) . '亿';
        } elseif ($this->amount >= 10000) {
            return number_format($this->amount / 10000, 2) . '万';
        }
        return number_format($this->amount, 2);
    }

    /**
     * 获取成交量格式化显示
     */
    public function getVolumeFormattedAttribute(): string
    {
        if ($this->volume >= 100000000) {
            return number_format($this->volume / 100000000, 2) . '亿股';
        } elseif ($this->volume >= 10000) {
            return number_format($this->volume / 10000, 2) . '万股';
        }
        return number_format($this->volume) . '股';
    }

    /**
     * 获取价格格式化显示
     */
    public function getPriceFormattedAttribute(): string
    {
        return number_format($this->close, 2);
    }
}
