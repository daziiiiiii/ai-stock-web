<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\Api\StockController;
use Illuminate\Container\Attributes\Log;

// use App\Http\Controllers\StockController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

// 公开路由 - 无需认证
// 仪表板
Route::get('dashboard', function () {
    $user = auth()->user();
    
    // 如果用户未登录，显示公开的仪表板
    if (!$user) {
        return Inertia::render('dashboard', [
            'user' => null,
        ]);
    }
    
    // 如果用户已登录，显示个性化仪表板
    return Inertia::render('dashboard', [
        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'subscription' => $user->subscription ? [
                'plan' => $user->subscription->plan,
                'status' => $user->subscription->status,
                'expires_at' => $user->subscription->expires_at?->toDateString(),
            ] : null,
            'today_usage' => $user->today_usage,
            'remaining_queries' => $user->remaining_queries,
            'daily_query_limit' => $user->daily_query_limit,
        ],
    ]);
})->name('dashboard');

// 公开路由 - 所有人都可以访问
Route::middleware([])->group(function () {

    // 股票列表页面
    Route::get('stocks', function () {
        // 获取股票列表数据
        $stockController = new StockController(new \App\Services\StockDataService());
        $request = request();
        
        $response = $stockController->index($request);
        $data = json_decode($response->getContent(), true);
        
        // 获取剩余查询次数
        $remainingResponse = $stockController->remainingQueries($request);
        $remainingData = json_decode($remainingResponse->getContent(), true);
        
        return Inertia::render('stocks/index', [
            'stocks' => $data['data'] ?? [],
            'meta' => $data['meta'] ?? [],
            'filters' => [
                'search' => $request->get('search'),
                'market' => $request->get('market'),
                'industry' => $request->get('industry'),
            ],
            'remaining_queries' => $remainingData['data']['remaining_queries'] ?? 0,
            'daily_limit' => $remainingData['data']['daily_limit'] ?? 3,
        ]);
    })->name('stocks.index');

    // 股票详情页面
    Route::get('stocks/{symbol}', function ($symbol) {
        // 获取股票详情数据
        $stockController = new StockController(new \App\Services\StockDataService());
        $request = request();
        
        // 获取股票详情
        $response = $stockController->show($request, $symbol);
        $data = json_decode($response->getContent(), true);
        
        if (isset($data['error'])) {
            abort(404, $data['error']);
        }
        
        // 获取财务数据
        $financialsResponse = $stockController->financials($request, $symbol);
        $financialsData = json_decode($financialsResponse->getContent(), true);
        
        // 获取历史数据
        $historyResponse = $stockController->history($request, $symbol);
        $historyData = json_decode($historyResponse->getContent(), true);
        
        // 获取技术指标
        $indicatorsResponse = $stockController->indicators($request, $symbol);
        $indicatorsData = json_decode($indicatorsResponse->getContent(), true);
        
        // 获取剩余查询次数
        $remainingResponse = $stockController->remainingQueries($request);
        $remainingData = json_decode($remainingResponse->getContent(), true);
        
        return Inertia::render('stocks/show', [
            'stock' => $data['data']['stock'] ?? [],
            'realtime' => $data['data']['realtime'] ?? [],
            'financials' => $financialsData['data'] ?? [],
            'historical' => $historyData['data'] ?? [],
            'indicators' => $indicatorsData['data'] ?? [],
            'remaining_queries' => $remainingData['data']['remaining_queries'] ?? 0,
            'daily_limit' => $remainingData['data']['daily_limit'] ?? 3,
        ]);
    })->name('stocks.show');

    // 财务分析页面
    Route::get('financial-analysis', [\App\Http\Controllers\FinancialAnalysisController::class, 'index'])->name('financial-analysis.index');
});

require __DIR__.'/settings.php';
