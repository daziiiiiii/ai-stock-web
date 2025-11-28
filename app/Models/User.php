<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    /**
     * 获取用户的订阅信息
     */
    public function subscription(): HasOne
    {
        return $this->hasOne(Subscription::class);
    }

    /**
     * 获取用户的使用记录
     */
    public function usageRecords(): HasMany
    {
        return $this->hasMany(UsageRecord::class);
    }

    /**
     * 获取用户的自选股
     */
    public function watchlists(): HasMany
    {
        return $this->hasMany(Watchlist::class);
    }

    /**
     * 获取用户的投资组合
     */
    public function portfolios(): HasMany
    {
        return $this->hasMany(Portfolio::class);
    }

    /**
     * 检查用户是否具有活跃订阅
     */
    public function hasActiveSubscription(): bool
    {
        return $this->subscription && $this->subscription->isActive();
    }

    /**
     * 检查用户是否在试用期内
     */
    public function isOnTrial(): bool
    {
        return $this->subscription && $this->subscription->isOnTrial();
    }

    /**
     * 获取用户当前订阅计划
     */
    public function getCurrentPlanAttribute(): string
    {
        return $this->subscription ? $this->subscription->plan : Subscription::PLAN_FREE;
    }

    /**
     * 获取用户每日查询限额
     */
    public function getDailyQueryLimitAttribute(): int
    {
        if ($this->subscription) {
            return $this->subscription->getDailyQueryLimit();
        }
        return 3; // 免费用户默认3次
    }

    /**
     * 获取用户今日已使用查询次数
     */
    public function getTodayUsageAttribute(): int
    {
        return $this->usageRecords()
            ->where('date', today())
            ->sum('query_count');
    }

    /**
     * 获取用户剩余查询次数
     */
    public function getRemainingQueriesAttribute(): int
    {
        $limit = $this->daily_query_limit;
        $usage = $this->today_usage;
        return max(0, $limit - $usage);
    }

    /**
     * 检查用户是否可以执行查询
     */
    public function canMakeQuery(): bool
    {
        return $this->remaining_queries > 0;
    }

    /**
     * 检查用户是否可以访问高级功能
     */
    public function canAccessPremiumFeatures(): bool
    {
        return $this->subscription && $this->subscription->canAccessPremiumFeatures();
    }

    /**
     * 检查用户是否可以访问AI功能
     */
    public function canAccessAIFeatures(): bool
    {
        return $this->subscription && $this->subscription->canAccessAIFeatures();
    }

    /**
     * 检查用户是否可以导出数据
     */
    public function canExportData(): bool
    {
        return $this->subscription && $this->subscription->canExportData();
    }

    /**
     * 检查用户是否可以访问API
     */
    public function canAccessApi(): bool
    {
        return $this->subscription && $this->subscription->canAccessApi();
    }
}
