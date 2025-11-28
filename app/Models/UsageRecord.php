<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UsageRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'ip_address',
        'stock_symbol',
        'endpoint',
        'query_count',
        'date',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    /**
     * 获取所属用户
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * 获取今日使用量（按IP地址或用户ID）
     */
    public static function getDailyUsage(string $ipAddress, ?int $userId = null): int
    {
        $query = self::where('date', today());
        
        if ($userId) {
            $query->where('user_id', $userId);
        } else {
            $query->where('ip_address', $ipAddress);
        }

        return $query->sum('query_count');
    }

    /**
     * 记录使用情况
     */
    public static function recordUsage(string $ipAddress, ?int $userId, string $stockSymbol, string $endpoint, int $count = 1): void
    {
        self::create([
            'user_id' => $userId,
            'ip_address' => $ipAddress,
            'stock_symbol' => $stockSymbol,
            'endpoint' => $endpoint,
            'query_count' => $count,
            'date' => today(),
        ]);
    }

    /**
     * 检查是否超过每日限额
     */
    public static function isOverDailyLimit(string $ipAddress, ?int $userId, int $limit): bool
    {
        $usage = self::getDailyUsage($ipAddress, $userId);
        return $usage >= $limit;
    }

    /**
     * 获取剩余查询次数
     */
    public static function getRemainingQueries(string $ipAddress, ?int $userId, int $limit): int
    {
        $usage = self::getDailyUsage($ipAddress, $userId);
        return max(0, $limit - $usage);
    }

    /**
     * 重置某天的使用记录（用于测试或管理）
     */
    public static function resetDailyUsage(string $ipAddress, ?int $userId, string $date): void
    {
        $query = self::where('date', $date);
        
        if ($userId) {
            $query->where('user_id', $userId);
        } else {
            $query->where('ip_address', $ipAddress);
        }

        $query->delete();
    }
}
