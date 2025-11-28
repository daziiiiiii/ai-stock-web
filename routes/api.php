<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\StockController;
use App\Http\Controllers\FinancialAnalysisController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// 公开API路由 - 无需认证
Route::middleware(['throttle:60,1'])->group(function () {
    // 股票相关API
    Route::prefix('stocks')->group(function () {
        // 获取股票列表
        Route::get('/', [StockController::class, 'index']);
        
        // 获取股票详情
        Route::get('/{symbol}', [StockController::class, 'show']);
        
        // 获取股票历史数据
        Route::get('/{symbol}/history', [StockController::class, 'history']);
        
        // 获取股票财务数据
        Route::get('/{symbol}/financials', [StockController::class, 'financials']);
        
        // 获取技术指标
        Route::get('/{symbol}/indicators', [StockController::class, 'indicators']);
        
        // 获取行业对比数据
        Route::get('/{symbol}/industry-comparison', [StockController::class, 'industryComparison']);
        
        // 获取剩余查询次数
        Route::get('/remaining-queries', [StockController::class, 'remainingQueries']);
    });

    // 财务分析相关API
    Route::prefix('financial-analysis')->group(function () {
        // 财务指标趋势分析
        Route::get('/trend/{symbol}', [FinancialAnalysisController::class, 'trendAnalysis']);
        
        // 行业对比分析
        Route::get('/industry-comparison', [FinancialAnalysisController::class, 'industryComparison']);
        
        // 财务健康度评估
        Route::get('/health/{symbol}', [FinancialAnalysisController::class, 'financialHealth']);
    });
});

// 需要认证的API路由
Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {
    // 用户相关的API可以放在这里
    // 例如：自选股管理、投资组合等
    
    Route::prefix('user')->group(function () {
        // 用户个人信息
        Route::get('/profile', function () {
            return response()->json([
                'user' => auth()->user()
            ]);
        });
        
        // 用户订阅信息
        Route::get('/subscription', function () {
            $user = auth()->user();
            return response()->json([
                'subscription' => $user->subscription,
                'today_usage' => $user->today_usage,
                'remaining_queries' => $user->remaining_queries,
            ]);
        });
    });
});

// 管理API路由（需要管理员权限）
Route::middleware(['auth:sanctum', 'admin', 'throttle:30,1'])->group(function () {
    // 管理相关的API可以放在这里
    // 例如：数据更新、用户管理等
});
