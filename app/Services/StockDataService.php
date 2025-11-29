<?php

namespace App\Services;

use App\Models\Stock;
use App\Models\StockDailyData;
use App\Models\FinancialData;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

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
        $cacheKey = "stock_realtime_{$symbol}";

        return Cache::remember($cacheKey, 60, function () use ($symbol) {
            try {
                $response = Http::post('http://api.tushare.pro', [
                    'api_name' => 'realtime_quote',
                    'token' => $this->tushareToken,
                    'params' => ['ts_code' => $symbol],
                    'fields' => 'ts_code,name,open,high,low,close,pre_close,change,pct_chg,vol,amount',
                ]);

                $data = $response->json();
                
                if ($data['code'] === 0 && !empty($data['data']['items'])) {
                    $item = $data['data']['items'][0];
                    return [
                        'symbol' => $item[0],
                        'name' => $item[1],
                        'open' => $item[2],
                        'high' => $item[3],
                        'low' => $item[4],
                        'close' => $item[5],
                        'prev_close' => $item[6],
                        'change' => $item[7],
                        'change_percent' => $item[8],
                        'volume' => $item[9],
                        'amount' => $item[10],
                    ];
                }
            } catch (\Exception $e) {
                Log::error('获取股票实时数据失败', [
                    'symbol' => $symbol,
                    'error' => $e->getMessage()
                ]);
            }

            return [];
        });
    }

    /**
     * 获取股票历史数据
     */
    public function getHistoricalData(string $symbol, string $period = 'day', int $limit = 100): array
    {
        $cacheKey = "stock_history_{$symbol}_{$period}_{$limit}";

        // return Cache::remember($cacheKey, 3600, function () use ($symbol, $period, $limit) {
            $stock = Stock::where('symbol', $symbol)->first();
            if (!$stock) {
                return [];
            }

            return $stock->dailyData()
                ->orderBy('date', 'desc')
                ->limit($limit)
                ->get()
                ->map(function ($item) {
                    return [
                        'date' => $item->date->format('Y-m-d'),
                        'open' => $item->open,
                        'high' => $item->high,
                        'low' => $item->low,
                        'close' => $item->close,
                        'volume' => $item->volume,
                        'amount' => $item->amount,
                        'change' => $item->change,
                        'change_percent' => $item->change_percent,
                    ];
                })
                ->toArray();
        // });
    }

    /**
     * 获取财务数据
     */
    public function getFinancialData(string $symbol, string $period = 'quarter', int $limit = 8): array
    {
        $cacheKey = "stock_financial_{$symbol}_{$period}_{$limit}";

        // return Cache::remember($cacheKey, 86400, function () use ($symbol, $period, $limit) {
            $stock = Stock::where('symbol', $symbol)->first();
            if (!$stock) {
                return [];
            }

            return $stock->financialIndicators()
                // ->where('report_period', $period)
                ->orderBy('report_date', 'desc')
                ->limit($limit)
                ->get()
                ->map(function ($item) {
                    return [
                        'report_date' => $item->report_date,
                        'report_period' => $item->report_period,
                        'ann_date' => $item->ann_date,
                        'end_date' => $item->end_date,
                        'eps' => $item->eps,
                        'dt_eps' => $item->dt_eps,
                        'total_revenue_ps' => $item->total_revenue_ps,
                        'revenue_ps' => $item->revenue_ps,
                        'gross_margin' => $item->gross_margin,
                        'current_ratio' => $item->current_ratio,
                        'quick_ratio' => $item->quick_ratio,
                        'cash_ratio' => $item->cash_ratio,
                        'ar_turn' => $item->ar_turn,
                        'assets_turn' => $item->assets_turn,
                        'op_income' => $item->op_income,
                        'ebit' => $item->ebit,
                        'ebitda' => $item->ebitda,
                        'fcff' => $item->fcff,
                        'fcfe' => $item->fcfe,
                        'bps' => $item->bps,
                        'ocfps' => $item->ocfps,
                        'cfps' => $item->cfps,
                        'ebit_ps' => $item->ebit_ps,
                        'fcff_ps' => $item->fcff_ps,
                        'fcfe_ps' => $item->fcfe_ps,
                        'netprofit_margin' => $item->netprofit_margin,
                        'grossprofit_margin' => $item->grossprofit_margin,
                        'roe' => $item->roe,
                        'roa' => $item->roa,
                        'debt_to_assets' => $item->debt_to_assets,
                        'roa_yearly' => $item->roa_yearly,
                        'roe_yearly' => $item->roe_yearly,
                        'basic_eps_yoy' => $item->basic_eps_yoy,
                        'dt_eps_yoy' => $item->dt_eps_yoy,
                        'netprofit_yoy' => $item->netprofit_yoy,
                        'tr_yoy' => $item->tr_yoy,
                        'or_yoy' => $item->or_yoy,
                    ];
                })
                ->toArray();
        // });
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
                case 'kdj':
                    $results['kdj'] = $this->calculateKDJ($data);
                    break;
                case 'boll':
                    $results['boll'] = $this->calculateBollingerBands($data);
                    break;
            }
        }

        return $results;
    }

    /**
     * 计算移动平均线
     */
    private function calculateMA(array $data, array $periods = [5, 10, 20, 60]): array
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

    /**
     * 计算MACD指标
     */
    private function calculateMACD(array $data): array
    {
        $closes = array_column($data, 'close');
        $ema12 = $this->calculateEMA($closes, 12);
        $ema26 = $this->calculateEMA($closes, 26);
        
        $dif = [];
        $dea = [];
        $macd = [];
        
        for ($i = 0; $i < count($closes); $i++) {
            if ($ema12[$i] !== null && $ema26[$i] !== null) {
                $dif[] = $ema12[$i] - $ema26[$i];
            } else {
                $dif[] = null;
            }
        }
        
        $dea = $this->calculateEMA($dif, 9);
        
        for ($i = 0; $i < count($dif); $i++) {
            if ($dif[$i] !== null && $dea[$i] !== null) {
                $macd[] = 2 * ($dif[$i] - $dea[$i]);
            } else {
                $macd[] = null;
            }
        }
        
        return [
            'dif' => $dif,
            'dea' => $dea,
            'macd' => $macd,
        ];
    }

    /**
     * 计算RSI指标
     */
    private function calculateRSI(array $data, int $period = 14): array
    {
        $closes = array_column($data, 'close');
        $rsi = [];
        
        for ($i = 0; $i < count($closes); $i++) {
            if ($i < $period) {
                $rsi[] = null;
                continue;
            }
            
            $gains = 0;
            $losses = 0;
            
            for ($j = 0; $j < $period; $j++) {
                $change = $closes[$i - $j] - $closes[$i - $j - 1];
                if ($change > 0) {
                    $gains += $change;
                } else {
                    $losses += abs($change);
                }
            }
            
            $avgGain = $gains / $period;
            $avgLoss = $losses / $period;
            
            if ($avgLoss == 0) {
                $rsi[] = 100;
            } else {
                $rs = $avgGain / $avgLoss;
                $rsi[] = round(100 - (100 / (1 + $rs)), 2);
            }
        }
        
        return $rsi;
    }

    /**
     * 计算KDJ指标
     */
    private function calculateKDJ(array $data): array
    {
        // 简化实现，实际需要更复杂的计算
        $highs = array_column($data, 'high');
        $lows = array_column($data, 'low');
        $closes = array_column($data, 'close');
        
        $k = [];
        $d = [];
        $j = [];
        
        for ($i = 0; $i < count($closes); $i++) {
            if ($i < 8) {
                $k[] = $d[] = $j[] = null;
                continue;
            }
            
            // 简化计算，实际需要更精确的算法
            $highestHigh = max(array_slice($highs, $i - 8, 9));
            $lowestLow = min(array_slice($lows, $i - 8, 9));
            
            $rsv = ($closes[$i] - $lowestLow) / ($highestHigh - $lowestLow) ;
            $k[] = round(($rsv + (isset($k[$i-1]) ? $k[$i-1] * 2 : 50)) / 3, 2);
            $d[] = round(($k[$i] + (isset($d[$i-1]) ? $d[$i-1] * 2 : 50)) / 3, 2);
            $j[] = round(3 * $k[$i] - 2 * $d[$i], 2);
        }
        
        return [
            'k' => $k,
            'd' => $d,
            'j' => $j,
        ];
    }

    /**
     * 计算布林带
     */
    private function calculateBollingerBands(array $data): array
    {
        $closes = array_column($data, 'close');
        $upper = [];
        $middle = [];
        $lower = [];
        
        for ($i = 0; $i < count($closes); $i++) {
            if ($i < 19) {
                $upper[] = $middle[] = $lower[] = null;
                continue;
            }
            
            $slice = array_slice($closes, $i - 19, 20);
            $ma = array_sum($slice) / 20;
            $std = $this->calculateStandardDeviation($slice);
            
            $middle[] = round($ma, 2);
            $upper[] = round($ma + 2 * $std, 2);
            $lower[] = round($ma - 2 * $std, 2);
        }
        
        return [
            'upper' => $upper,
            'middle' => $middle,
            'lower' => $lower,
        ];
    }

    /**
     * 计算指数移动平均
     */
    private function calculateEMA(array $data, int $period): array
    {
        $ema = [];
        $multiplier = 2 / ($period + 1);
        
        for ($i = 0; $i < count($data); $i++) {
            if ($i === 0) {
                $ema[] = $data[$i];
            } else {
                $ema[] = $data[$i] * $multiplier + $ema[$i-1] * (1 - $multiplier);
            }
        }
        
        return $ema;
    }

    /**
     * 计算标准差
     */
    private function calculateStandardDeviation(array $data): float
    {
        $mean = array_sum($data) / count($data);
        $variance = 0.0;
        
        foreach ($data as $value) {
            $variance += pow($value - $mean, 2);
        }
        
        return sqrt($variance / count($data));
    }

    /**
     * 批量更新股票数据
     */
    public function batchUpdateStockData(array $symbols): void
    {
        foreach ($symbols as $symbol) {
            try {
                $this->updateStockData($symbol);
                // 防止请求过于频繁
                usleep(100000); // 100ms
            } catch (\Exception $e) {
                Log::error('更新股票数据失败', [
                    'symbol' => $symbol,
                    'error' => $e->getMessage()
                ]);
            }
        }
    }

    /**
     * 更新单个股票数据
     */
    public function updateStockData(string $symbol): void
    {
        // 实现数据更新逻辑
        // 这里可以调用Tushare API获取最新数据并更新数据库
    }
}
