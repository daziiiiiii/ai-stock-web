# AI Stock Web 技术实现文档

## 🏗️ 系统架构设计

### 整体架构图
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端应用      │    │   API网关       │    │   数据服务      │
│   (React)       │◄──►│   (Laravel)     │◄──►│   (Tushare等)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   实时数据      │    │   缓存层        │    │   数据库        │
│   (WebSocket)   │    │   (Redis)       │    │   (MySQL)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📊 数据模型设计

### Stock 模型
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Stock extends Model
{
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

    public function dailyData(): HasMany
    {
        return $this->hasMany(StockDailyData::class);
    }

    public function technicalIndicators(): HasMany
    {
        return $this->hasMany(TechnicalIndicator::class);
    }
}
```

### StockDailyData 模型
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockDailyData extends Model
{
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

    public function stock(): BelongsTo
    {
        return $this->belongsTo(Stock::class);
    }
}
```

### FinancialData 模型（基本面分析）
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FinancialData extends Model
{
    protected $fillable = [
        'stock_id',
        'report_date',
        'report_period', // 季度/年度
        'revenue',       // 营业收入
        'net_income',    // 净利润
        'gross_profit',  // 毛利润
        'gross_margin',  // 毛利率
        'net_margin',    // 净利率
        'roe',           // 净资产收益率
        'roa',           // 总资产收益率
        'debt_ratio',    // 资产负债率
        'current_ratio', // 流动比率
        'quick_ratio',   // 速动比率
        'eps',           // 每股收益
        'pe_ratio',      // 市盈率
        'pb_ratio',      // 市净率
        'ps_ratio',      // 市销率
        'dividend_yield', // 股息率
        'peg_ratio',     // PEG比率
        'operating_cash_flow', // 经营现金流
        'investing_cash_flow', // 投资现金流
        'financing_cash_flow', // 筹资现金流
    ];

    protected $casts = [
        'report_date' => 'date',
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

    public function stock(): BelongsTo
    {
        return $this->belongsTo(Stock::class);
    }
}
```

### Subscription 模型（订阅系统）
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
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

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE && 
               $this->ends_at->isFuture();
    }

    public function isOnTrial(): bool
    {
        return $this->trial_ends_at && $this->trial_ends_at->isFuture();
    }

    public function hasFeature(string $feature): bool
    {
        $features = $this->getPlanFeatures();
        return in_array($feature, $features);
    }

    private function getPlanFeatures(): array
    {
        return match($this->plan) {
            self::PLAN_FREE => [
                'daily_queries' => 3,
                'basic_analysis',
                'limited_history',
            ],
            self::PLAN_BASIC => [
                'daily_queries' => 50,
                'basic_analysis',
                'extended_history',
                'technical_indicators',
            ],
            self::PLAN_PRO => [
                'daily_queries' => 200,
                'advanced_analysis',
                'full_history',
                'all_technical_indicators',
                'ai_predictions',
                'portfolio_management',
            ],
            self::PLAN_ENTERPRISE => [
                'daily_queries' => 1000,
                'all_features',
                'api_access',
                'priority_support',
                'custom_reports',
            ],
            default => [],
        };
    }
}
```

### UsageRecord 模型（使用记录）
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UsageRecord extends Model
{
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

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

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
}
```

## 🔌 API 接口设计

### 股票相关接口

#### 1. 获取股票列表
```http
GET /api/stocks
```
**参数**:
- `page` (可选): 页码
- `per_page` (可选): 每页数量
- `market` (可选): 市场类型
- `industry` (可选): 行业
- `search` (可选): 搜索关键词

**响应**:
```json
{
    "data": [
        {
            "id": 1,
            "symbol": "600519.SH",
            "name": "贵州茅台",
            "market": "SH",
            "industry": "白酒",
            "current_price": 1680.50,
            "change": 25.80,
            "change_percent": 1.56
        }
    ],
    "meta": {
        "current_page": 1,
        "total": 1000,
        "per_page": 20
    }
}
```

#### 2. 获取股票详情
```http
GET /api/stocks/{symbol}
```
**响应**:
```json
{
    "data": {
        "id": 1,
        "symbol": "600519.SH",
        "name": "贵州茅台",
        "market": "SH",
        "industry": "白酒",
        "current_price": 1680.50,
        "change": 25.80,
        "change_percent": 1.56,
        "open": 1660.00,
        "high": 1690.00,
        "low": 1655.00,
        "volume": 1250000,
        "amount": 2100000000,
        "market_cap": 2100000000000,
        "pe_ratio": 35.2,
        "pb_ratio": 8.5
    }
}
```

#### 3. 获取股票历史数据
```http
GET /api/stocks/{symbol}/history
```
**参数**:
- `period` (可选): 时间周期 (day, week, month)
- `start_date` (可选): 开始日期
- `end_date` (可选): 结束日期
- `limit` (可选): 数据条数

**响应**:
```json
{
    "data": [
        {
            "date": "2024-01-15",
            "open": 1660.00,
            "high": 1690.00,
            "low": 1655.00,
            "close": 1680.50,
            "volume": 1250000,
            "amount": 2100000000
        }
    ]
}
```

#### 4. 获取技术指标
```http
GET /api/stocks/{symbol}/indicators
```
**参数**:
- `indicator` (必需): 指标类型 (ma, macd, kdj, rsi, boll)
- `period` (可选): 周期参数

**响应**:
```json
{
    "data": [
        {
            "date": "2024-01-15",
            "ma5": 1650.20,
            "ma10": 1620.50,
            "ma20": 1580.80
        }
    ]
}
```

#### 5. 获取财务数据（基本面分析核心接口）
```http
GET /api/stocks/{symbol}/financials
```
**参数**:
- `period` (可选): 报告期 (quarter, annual)
- `start_date` (可选): 开始日期
- `end_date` (可选): 结束日期
- `limit` (可选): 数据条数

**响应**:
```json
{
    "data": [
        {
            "report_date": "2024-03-31",
            "report_period": "quarter",
            "revenue": 12500000000,
            "net_income": 3500000000,
            "gross_profit": 8500000000,
            "gross_margin": 0.68,
            "net_margin": 0.28,
            "roe": 0.215,
            "roa": 0.125,
            "debt_ratio": 0.42,
            "current_ratio": 2.15,
            "quick_ratio": 1.85,
            "eps": 2.85,
            "pe_ratio": 35.2,
            "pb_ratio": 8.5,
            "ps_ratio": 12.8,
            "dividend_yield": 0.018,
            "peg_ratio": 1.25,
            "operating_cash_flow": 4200000000,
            "investing_cash_flow": -1500000000,
            "financing_cash_flow": -800000000
        }
    ]
}
```

#### 6. 获取财务指标趋势
```http
GET /api/stocks/{symbol}/financial-trends
```
**参数**:
- `metric` (必需): 指标名称 (revenue, net_income, roe, gross_margin等)
- `period` (可选): 时间周期 (quarter, annual)

**响应**:
```json
{
    "data": [
        {
            "report_date": "2023-03-31",
            "value": 0.185
        },
        {
            "report_date": "2023-06-30",
            "value": 0.192
        },
        {
            "report_date": "2023-09-30",
            "value": 0.205
        },
        {
            "report_date": "2023-12-31",
            "value": 0.215
        }
    ],
    "trend": "up", // 趋势方向: up, down, stable
    "growth_rate": 0.162 // 增长率
}
```

#### 7. 获取行业对比数据
```http
GET /api/stocks/{symbol}/industry-comparison
```
**响应**:
```json
{
    "data": {
        "current_stock": {
            "symbol": "600519.SH",
            "name": "贵州茅台",
            "pe_ratio": 35.2,
            "pb_ratio": 8.5,
            "roe": 0.215,
            "gross_margin": 0.68
        },
        "industry_average": {
            "pe_ratio": 28.5,
            "pb_ratio": 6.2,
            "roe": 0.185,
            "gross_margin": 0.52
        },
        "industry_rank": {
            "pe_ratio": 3,
            "pb_ratio": 2,
            "roe": 1,
            "gross_margin": 1
        }
    }
}
```

## 🎨 前端组件设计

### StockChart 组件
```tsx
// resources/js/components/stocks/StockChart.tsx
import React from 'react';
import { useStockData } from '@/hooks/useStockData';

interface StockChartProps {
    symbol: string;
    period?: 'day' | 'week' | 'month';
    chartType?: 'kline' | 'line' | 'candle';
    indicators?: string[];
}

export default function StockChart({ 
    symbol, 
    period = 'day', 
    chartType = 'kline',
    indicators = [] 
}: StockChartProps) {
    const { data, loading, error } = useStockData(symbol, period);

    if (loading) return <div>加载中...</div>;
    if (error) return <div>加载失败: {error.message}</div>;

    return (
        <div className="stock-chart">
            <div className="chart-header">
                <h3>{data?.name} ({symbol})</h3>
                <div className="chart-controls">
                    {/* 图表控制按钮 */}
                </div>
            </div>
            <div className="chart-container">
                {/* ECharts 图表容器 */}
            </div>
            <div className="chart-footer">
                {/* 技术指标选择器 */}
            </div>
        </div>
    );
}
```

### TechnicalIndicators 组件
```tsx
// resources/js/components/stocks/TechnicalIndicators.tsx
import React, { useState } from 'react';

interface TechnicalIndicatorsProps {
    symbol: string;
    onIndicatorChange?: (indicators: string[]) => void;
}

export default function TechnicalIndicators({ 
    symbol, 
    onIndicatorChange 
}: TechnicalIndicatorsProps) {
    const [selectedIndicators, setSelectedIndicators] = useState<string[]>([]);

    const availableIndicators = [
        { id: 'ma', name: '移动平均线', defaultParams: { period: 5 } },
        { id: 'macd', name: 'MACD', defaultParams: { fast: 12, slow: 26, signal: 9 } },
        { id: 'kdj', name: 'KDJ', defaultParams: { period: 9 } },
        { id: 'rsi', name: 'RSI', defaultParams: { period: 14 } },
        { id: 'boll', name: '布林带', defaultParams: { period: 20, std: 2 } },
    ];

    const handleIndicatorToggle = (indicatorId: string) => {
        const newIndicators = selectedIndicators.includes(indicatorId)
            ? selectedIndicators.filter(id => id !== indicatorId)
            : [...selectedIndicators, indicatorId];
        
        setSelectedIndicators(newIndicators);
        onIndicatorChange?.(newIndicators);
    };

    return (
        <div className="technical-indicators">
            <h4>技术指标</h4>
            <div className="indicators-grid">
                {availableIndicators.map(indicator => (
                    <div key={indicator.id} className="indicator-item">
                        <label>
                            <input
                                type="checkbox"
                                checked={selectedIndicators.includes(indicator.id)}
                                onChange={() => handleIndicatorToggle(indicator.id)}
                            />
                            {indicator.name}
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
}
```

## 🔧 服务类设计

### StockDataService
```php
<?php

namespace App\Services;

use App\Models\Stock;
use App\Models\StockDailyData;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class StockDataService
{
    private $tushareToken;

    public function __construct()
    {
        $this->tushareToken = config('services.tushare.token');
    }

    /**
     * 获取股票实时数据
     */
    public function getRealtimeData(string $symbol): array
    {
        return Cache::remember("stock_realtime_{$symbol}", 60, function () use ($symbol) {
            // 调用Tushare API获取实时数据
            $response = Http::post('http://api.tushare.pro', [
                'api_name' => 'realtime_quote',
                'token' => $this->tushareToken,
                'params' => ['ts_code' => $symbol],
                'fields' => 'ts_code,name,open,high,low,close,pre_close,change,pct_chg,vol,amount',
            ]);

            return $response->json()['data']['items'][0] ?? [];
        });
    }

    /**
     * 获取股票历史数据
     */
    public function getHistoricalData(string $symbol, string $period = 'day', int $limit = 100): array
    {
        $cacheKey = "stock_history_{$symbol}_{$period}_{$limit}";

        return Cache::remember($cacheKey, 3600, function () use ($symbol, $period, $limit) {
            $stock = Stock::where('symbol', $symbol)->first();
            if (!$stock) {
                return [];
            }

            return $stock->dailyData()
                ->orderBy('date', 'desc')
                ->limit($limit)
                ->get()
                ->toArray();
        });
    }

    /**
     * 计算技术指标
     */
    public function calculateTechnicalIndicators(array $data, array $indicators): array
    {
        $results = [];

        foreach ($indicators as $indicator) {
            switch ($indicator) {
                case 'ma':
                    $results['ma'] = $this->calculateMA($data);
                    break;
                case 'macd':
                    $results['macd'] = $this->calculateMACD($data);
                    break;
                case 'rsi':
                    $results['rsi'] = $this->calculateRSI($data);
                    break;
                // 其他指标...
            }
        }

        return $results;
    }

    private function calculateMA(array $data, array $periods = [5, 10, 20]): array
    {
        $result = [];
        $closes = array_column($data, 'close');
        
        foreach ($periods as $period) {
            $maValues = [];
            for ($i = 0; $i < count($closes); $i++) {
                if ($i < $period - 1) {
                    $maValues[] = null;
                } else {
                    $sum = 0;
                    for ($j = 0; $j < $period; $j++) {
                        $sum += $closes[$i - $j];
                    }
                    $maValues[] = round($sum / $period, 2);
                }
            }
            $result["ma{$period}"] = $maValues;
        }

        return $result;
    }

    // 其他技术指标计算方法...
}
```

## 📈 实时数据更新

### WebSocket 服务
```javascript
// resources/js/services/websocket.js
class StockWebSocket {
    constructor() {
        this.socket = null;
        this.subscriptions = new Set();
        this.messageHandlers = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
    }

    connect() {
        try {
            this.socket = new WebSocket('ws://localhost:6001');

            this.socket.onopen = () => {
                console.log('WebSocket connected');
                this.reconnectAttempts = 0;
                // 重新订阅所有股票
                this.subscriptions.forEach(symbol => {
                    this.subscribe(symbol);
                });
            };

            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (error) {
                    console.error('WebSocket message parsing error:', error);
                }
            };

            this.socket.onclose = (event) => {
                console.log(`WebSocket disconnected: ${event.code} ${event.reason}`);
                this.handleReconnect();
            };

            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
        } catch (error) {
            console.error('WebSocket connection error:', error);
            this.handleReconnect();
        }
    }

    handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
            console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
            setTimeout(() => this.connect(), delay);
        } else {
            console.error('Max reconnection attempts reached');
            // 切换到轮询模式
            this.fallbackToPolling();
        }
    }

    fallbackToPolling() {
        console.log('Switching to polling mode');
        // 实现轮询逻辑
        this.pollingInterval = setInterval(() => {
            this.subscriptions.forEach(symbol => {
                this.fetchStockData(symbol);
            });
        }, 5000);
    }

    subscribe(symbol) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'subscribe',
                symbol: symbol
            }));
            this.subscriptions.add(symbol);
        }
    }

    unsubscribe(symbol) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'unsubscribe',
                symbol: symbol
            }));
            this.subscriptions.delete(symbol);
        }
    }

    handleMessage(data) {
        const handlers = this.messageHandlers.get(data.symbol) || [];
        handlers.forEach(handler => handler(data));
    }

    onMessage(symbol, handler) {
        if (!this.messageHandlers.has(symbol)) {
            this.messageHandlers.set(symbol, []);
        }
        this.messageHandlers.get(symbol).push(handler);
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
        }
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }
    }
}

export const stockWebSocket = new StockWebSocket();
```

### 实时数据 Hook
```javascript
// resources/js/hooks/useRealtimeData.js
import { useState, useEffect, useRef } from 'react';
import { stockWebSocket } from '@/services/websocket';

export function useRealtimeData(symbol) {
    const [data, setData] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const dataRef = useRef();

    useEffect(() => {
        dataRef.current = data;
    }, [data]);

    useEffect(() => {
        if (!symbol) return;

        const handleMessage = (newData) => {
            setData(prevData => ({
                ...prevData,
                ...newData,
                timestamp: Date.now()
            }));
        };

        stockWebSocket.onMessage(symbol, handleMessage);
        stockWebSocket.subscribe(symbol);

        return () => {
            stockWebSocket.unsubscribe(symbol);
        };
    }, [symbol]);

    useEffect(() => {
        const checkConnection = () => {
            setIsConnected(stockWebSocket.socket?.readyState === WebSocket.OPEN);
        };

        // 定期检查连接状态
        const interval = setInterval(checkConnection, 5000);
        return () => clearInterval(interval);
    }, []);

    return { data, isConnected };
}
```

## 🧪 测试策略

### 单元测试示例
```php
<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\StockDataService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class StockDataServiceTest extends TestCase
{
    public function test_get_realtime_data()
    {
        Http::fake([
            'http://api.tushare.pro' => Http::response([
                'data' => [
                    'items' => [
                        ['600519.SH', '贵州茅台', 1680.50, 1690.00, 1655.00, 1680.50, 1660.00, 20.50, 1.23, 1250000, 2100000000]
                    ]
                ]
            ])
        ]);

        $service = new StockDataService();
        $result = $service->getRealtimeData('600519.SH');

        $this->assertIsArray($result);
        $this->assertEquals('600519.SH', $result[0]);
    }

    public function test_calculate_ma()
    {
        $service = new StockDataService();
        
        $testData = [
            ['close' => 10], ['close' => 12], ['close' => 14], 
            ['close' => 16], ['close' => 18], ['close' => 20]
        ];

        $result = $service->calculateMA($testData, [3]);

        $this->assertArrayHasKey('ma3', $result);
        $this->assertEquals(16, $result['ma3'][5]); // 最后一天的MA3应该是16
    }
}
```

## 🚀 部署配置

### Docker 配置示例
```dockerfile
# Dockerfile
FROM php:8.2-fpm

# 安装必要的扩展
RUN docker-php-ext-install pdo pdo_mysql

# 安装 Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .

RUN composer install --no-dev --optimize-autoloader
```

### Nginx 配置
```nginx
server {
    listen 80;
    server_name aistock.example.com;
    root /var/www/html/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

---

这份技术实现文档提供了完整的开发指导，包括数据模型、API设计、前端组件、服务类实现等关键部分。开发团队可以根据这份文档进行具体的编码实现。
