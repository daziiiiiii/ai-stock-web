import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, BarChart3, LineChart, PieChart, Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';

// Import modular components
import Overview from './components/overview';
import FinancialData from './components/financial-data';
import HistoricalData from './components/historical-data';
import TechnicalIndicators from './components/technical-indicators';
import { formatPrice, formatChange, formatChangePercent, formatNumber, getChangeColor, getChangeIcon, getMarketBadge } from './components/utils';

interface Stock {
    id: number;
    symbol: string;
    name: string;
    market: string;
    industry: string | null;
    status: string;
    list_date: string | null;
}

interface RealtimeData {
    symbol: string;
    name: string;
    open: number;
    high: number;
    low: number;
    close: number;
    prev_close: number;
    change: number;
    change_percent: number;
    volume: number;
    amount: number;
}

interface FinancialData {
    report_date: string;
    report_period: string;
    ann_date: string | null;
    end_date: string | null;
    eps: number | null;
    dt_eps: number | null;
    total_revenue_ps: number | null;
    revenue_ps: number | null;
    gross_margin: number | null;
    current_ratio: number | null;
    quick_ratio: number | null;
    cash_ratio: number | null;
    ar_turn: number | null;
    assets_turn: number | null;
    op_income: number | null;
    ebit: number | null;
    ebitda: number | null;
    fcff: number | null;
    fcfe: number | null;
    bps: number | null;
    ocfps: number | null;
    cfps: number | null;
    ebit_ps: number | null;
    fcff_ps: number | null;
    fcfe_ps: number | null;
    netprofit_margin: number | null;
    grossprofit_margin: number | null;
    roe: number | null;
    roa: number | null;
    debt_to_assets: number | null;
    roa_yearly: number | null;
    roe_yearly: number | null;
    basic_eps_yoy: number | null;
    dt_eps_yoy: number | null;
    netprofit_yoy: number | null;
    tr_yoy: number | null;
    or_yoy: number | null;
}

interface StockShowProps {
    stock: Stock;
    realtime: RealtimeData;
    financials: FinancialData[];
    historical: any[];
    indicators: any;
    remaining_queries: number;
    daily_limit: number;
}

const ChangeIcon = ({ change }: { change: number }) => {
    const iconType = getChangeIcon(change);
    const color = getChangeColor(change);
    
    switch (iconType) {
        case 'trending-up':
            return <TrendingUp className={`h-4 w-4 ${color}`} />;
        case 'trending-down':
            return <TrendingDown className={`h-4 w-4 ${color}`} />;
        default:
            return <Minus className={`h-4 w-4 ${color}`} />;
    }
};

export default function StockShow({ stock, realtime, financials, historical, indicators, remaining_queries, daily_limit }: StockShowProps) {
    const [activeTab, setActiveTab] = useState('overview');

    const marketConfig = getMarketBadge(stock.market);

    return (
        <AppLayout>
            <Head title={`${stock.symbol} - ${stock.name}`} />

            <div className="space-y-6">
                {/* 页面标题和导航 */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <Button asChild variant="outline" size="sm">
                            <Link href="/stocks">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                返回列表
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                {stock.symbol} - {stock.name}
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant={marketConfig.variant}>{marketConfig.label}</Badge>
                                {stock.industry && (
                                    <Badge variant="secondary">{stock.industry}</Badge>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        今日剩余查询: <span className="font-semibold">{remaining_queries}</span> / {daily_limit}
                    </div>
                </div>

                {/* 实时数据概览 */}
                {realtime && (
                    <Card>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">最新价</p>
                                    <p className="text-2xl font-bold mt-1">{formatPrice(realtime.close)}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">涨跌额</p>
                                    <div className={`flex items-center justify-center gap-1 mt-1 ${getChangeColor(realtime.change)}`}>
                                        <ChangeIcon change={realtime.change} />
                                        <span className="text-lg font-semibold">{formatChange(realtime.change)}</span>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">涨跌幅</p>
                                    <p className={`text-lg font-semibold mt-1 ${getChangeColor(realtime.change_percent)}`}>
                                        {formatChangePercent(realtime.change_percent)}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">成交量</p>
                                    <p className="text-lg font-semibold mt-1">{formatNumber(realtime.volume)}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">成交额</p>
                                    <p className="text-lg font-semibold mt-1">{formatNumber(realtime.amount)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* 主要标签页 */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-4 w-full">
                        <TabsTrigger value="overview" className="flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            概览
                        </TabsTrigger>
                        <TabsTrigger value="financials" className="flex items-center gap-2">
                            <PieChart className="h-4 w-4" />
                            财务数据
                        </TabsTrigger>
                        <TabsTrigger value="historical" className="flex items-center gap-2">
                            <LineChart className="h-4 w-4" />
                            历史数据
                        </TabsTrigger>
                        <TabsTrigger value="indicators" className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            技术指标
                        </TabsTrigger>
                    </TabsList>

                    {/* 概览标签页 */}
                    <TabsContent value="overview">
                        <Overview stock={stock} realtime={realtime} financials={financials} />
                    </TabsContent>

                    {/* 财务数据标签页 */}
                    <TabsContent value="financials">
                        <FinancialData financials={financials} />
                    </TabsContent>

                    {/* 历史数据标签页 */}
                    <TabsContent value="historical">
                        <HistoricalData historical={historical} />
                    </TabsContent>

                    {/* 技术指标标签页 */}
                    <TabsContent value="indicators">
                        <TechnicalIndicators historical={historical} />
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
