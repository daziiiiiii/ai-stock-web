<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
    use HasFactory;

    const PLAN_FREE = 'free';
    const PLAN_BASIC = 'basic';
    const PLAN_PRO = 'pro';
    const PLAN_ENTERPRISE = 'enterprise';

    const STATUS_ACTIVE = 'active';
    const STATUS_CANCELED = 'canceled';
    const STATUS_EXPIRED = 'expired';

    protected $fillable = [
        'user_id',
        'plan',
        'status',
        'starts_at',
        'ends_at',
        'trial_ends_at',
        'canceled_at',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'trial_ends_at' => 'datetime',
        'canceled_at' => 'datetime',
    ];

    /**
     * 获取所属用户
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * 检查订阅是否激活
     */
    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE && 
               $this->ends_at && $this->ends_at->isFuture();
    }

    /**
     * 检查是否在试用期内
     */
    public function isOnTrial(): bool
    {
        return $this->trial_ends_at && $this->trial_ends_at->isFuture();
    }

    /**
     * 检查是否具有某个功能
     */
    public function hasFeature(string $feature): bool
    {
        $features = $this->getPlanFeatures();
        return in_array($feature, $features);
    }

    /**
     * 获取每日查询额度
     */
    public function getDailyQueryLimit(): int
    {
        $features = $this->getPlanFeatures();
        return $features['daily_queries'] ?? 3;
    }

    /**
     * 获取计划功能列表
     */
    private function getPlanFeatures(): array
    {
        return match($this->plan) {
            self::PLAN_FREE => [
                'daily_queries' => 3,
                'basic_analysis',
                'limited_history',
                'watchlist_limit' => 5,
            ],
            self::PLAN_BASIC => [
                'daily_queries' => 50,
                'basic_analysis',
                'extended_history',
                'technical_indicators',
                'watchlist_limit' => 20,
                'basic_alerts',
            ],
            self::PLAN_PRO => [
                'daily_queries' => 200,
                'advanced_analysis',
                'full_history',
                'all_technical_indicators',
                'ai_predictions',
                'portfolio_management',
                'watchlist_limit' => 100,
                'advanced_alerts',
                'export_reports',
            ],
            self::PLAN_ENTERPRISE => [
                'daily_queries' => 1000,
                'all_features',
                'api_access',
                'priority_support',
                'custom_reports',
                'watchlist_limit' => 500,
                'team_collaboration',
                'data_export',
            ],
            default => [
                'daily_queries' => 3,
                'basic_analysis',
                'limited_history',
                'watchlist_limit' => 5,
            ],
        };
    }

    /**
     * 获取计划显示名称
     */
    public function getPlanNameAttribute(): string
    {
        return match($this->plan) {
            self::PLAN_FREE => '免费版',
            self::PLAN_BASIC => '基础版',
            self::PLAN_PRO => '专业版',
            self::PLAN_ENTERPRISE => '企业版',
            default => '未知计划',
        };
    }

    /**
     * 获取状态显示名称
     */
    public function getStatusNameAttribute(): string
    {
        return match($this->status) {
            self::STATUS_ACTIVE => '激活',
            self::STATUS_CANCELED => '已取消',
            self::STATUS_EXPIRED => '已过期',
            default => '未知状态',
        };
    }

    /**
     * 获取剩余天数
     */
    public function getRemainingDaysAttribute(): ?int
    {
        if (!$this->ends_at) {
            return null;
        }

        return max(0, now()->diffInDays($this->ends_at, false));
    }

    /**
     * 获取试用期剩余天数
     */
    public function getTrialRemainingDaysAttribute(): ?int
    {
        if (!$this->trial_ends_at) {
            return null;
        }

        return max(0, now()->diffInDays($this->trial_ends_at, false));
    }

    /**
     * 检查是否可以访问高级功能
     */
    public function canAccessPremiumFeatures(): bool
    {
        return in_array($this->plan, [self::PLAN_PRO, self::PLAN_ENTERPRISE]);
    }

    /**
     * 检查是否可以访问AI功能
     */
    public function canAccessAIFeatures(): bool
    {
        return in_array($this->plan, [self::PLAN_PRO, self::PLAN_ENTERPRISE]);
    }

    /**
     * 检查是否可以导出数据
     */
    public function canExportData(): bool
    {
        return in_array($this->plan, [self::PLAN_PRO, self::PLAN_ENTERPRISE]);
    }

    /**
     * 检查是否可以访问API
     */
    public function canAccessApi(): bool
    {
        return $this->plan === self::PLAN_ENTERPRISE;
    }
}
