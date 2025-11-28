import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, BarChart3, LineChart, PieChart, Activity } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis, ComposedChart, Line } from 'recharts';

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
    revenue: number;
    net_income: number;
    gross_profit: number;
    gross_margin: number;
    net_margin: number;
    roe: number;
    roa: number;
    debt_ratio: number;
    current_ratio: number;
    quick_ratio: number;
    cash_ratio: number;
    eps: number;
    pe_ratio: number;
    pb_ratio: number;
    ps_ratio: number;
    dividend_yield: number;
    peg_ratio: number;
    operating_cash_flow: number;
    investing_cash_flow: number;
    financing_cash_flow: number;
    financial_health_score: number;
    financial_health_grade: string;
    // 成本费用字段
    oper_cost: number;
    sell_exp: number;
    admin_exp: number;
    fin_exp: number;
    total_profit: number;
    // 营运能力指标
    assets_turn: number;
    ar_turn: number;
    ca_turn: number;
    fa_turn: number;
    // 成长能力指标
    revenue_yoy: number;
    net_income_yoy: number;
    // 杜邦分析指标
    profit_margin: number;
    asset_turnover: number;
    equity_multiplier: number;
    // 现金流质量指标
    ocf_to_or: number;
    ocf_to_profit: number;
    cash_flow_adequacy: number;
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

export default function StockShow({ stock, realtime, financials, historical, indicators, remaining_queries, daily_limit }: StockShowProps) {
    // 调试点1: 查看所有传入的数据
    console.log('=== StockShow Props ===');
    console.log('stock:', stock);
    console.log('financials:', financials);
    console.log('historical:', historical);
    
    // 调试点2: 检查 financials 是否为空
    console.log('financials 数量:', financials?.length);
    console.log('第一条财务数据:', financials?.[0]);
    
    const [activeTab, setActiveTab] = useState('overview');

    // 准备图表数据 (反转数组以按时间正序排列)
    const chartFinancials = financials ? [...financials].reverse() : [];
    const chartHistorical = historical ? [...historical].reverse() : [];

    const getMarketBadge = (market: string) => {
        const marketConfig = {
            SH: { label: '沪市', variant: 'destructive' as const },
            SZ: { label: '深市', variant: 'default' as const },
            HK: { label: '港股', variant: 'outline' as const },
            US: { label: '美股', variant: 'secondary' as const },
        };

        const config = marketConfig[market as keyof typeof marketConfig] || { label: market, variant: 'default' as const };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const getChangeIcon = (change: number) => {
        if (change > 0) return <TrendingUp className="h-4 w-4 text-red-500" />;
        if (change < 0) return <TrendingDown className="h-4 w-4 text-green-500" />;
        return <Minus className="h-4 w-4 text-gray-500" />;
    };

    const getChangeColor = (change: number) => {
        if (change > 0) return 'text-red-500';
        if (change < 0) return 'text-green-500';
        return 'text-gray-500';
    };

    const formatPrice = (price: number) => {
        return price?.toFixed(2);
    };

    const formatChange = (change: number) => {
        return change > 0 ? `+${change?.toFixed(2)}` : change?.toFixed(2);
    };

    const formatChangePercent = (percent: number) => {
        return percent > 0 ? `+${percent?.toFixed(2)}%` : `${percent?.toFixed(2)}%`;
    };

    const formatNumber = (num: number) => {
        if (num >= 100000000) {
            return (num / 100000000)?.toFixed(2) + '亿';
        } else if (num >= 10000) {
            return (num / 10000)?.toFixed(2) + '万';
        }
        return num?.toFixed(2);
    };

    const getFinancialHealthColor = (grade: string) => {
        const colorMap = {
            'A+': 'text-green-600',
            'A': 'text-green-500',
            'B+': 'text-blue-500',
            'B': 'text-blue-400',
            'C+': 'text-yellow-500',
            'C': 'text-yellow-400',
            'D': 'text-orange-500',
            'E': 'text-red-500',
        };
        return colorMap[grade as keyof typeof colorMap] || 'text-gray-500';
    };

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
                                {getMarketBadge(stock.market)}
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
                                        {getChangeIcon(realtime.change)}
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
                    <TabsContent value="overview" className="space-y-6">
                        {/* 基本信息 */}
                        <Card>
                            <CardHeader>
                                <CardTitle>基本信息</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">股票代码</p>
                                        <p className="font-medium">{stock.symbol}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">股票名称</p>
                                        <p className="font-medium">{stock.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">市场</p>
                                        <p className="font-medium">{getMarketBadge(stock.market)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">行业</p>
                                        <p className="font-medium">{stock.industry || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">上市日期</p>
                                        <p className="font-medium">{stock.list_date || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">状态</p>
                                        <p className="font-medium">{stock.status}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 实时数据详情 */}
                        {realtime && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>实时数据</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">开盘价</p>
                                            <p className="font-medium">{formatPrice(realtime.open)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">最高价</p>
                                            <p className="font-medium">{formatPrice(realtime.high)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">最低价</p>
                                            <p className="font-medium">{formatPrice(realtime.low)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">昨收价</p>
                                            <p className="font-medium">{formatPrice(realtime.prev_close)}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* 最新财务数据 */}
                        {financials && financials.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>最新财务数据</CardTitle>
                                    <CardDescription>
                                        报告期: {financials[0].report_date} ({financials[0].report_period})
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">营业收入</p>
                                            <p className="font-medium">{formatNumber(financials[0].revenue)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">净利润</p>
                                            <p className="font-medium">{formatNumber(financials[0].net_income)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">毛利率</p>
                                            <p className="font-medium">{(financials[0].gross_margin * 1)?.toFixed(2)}%</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">ROE</p>
                                            <p className="font-medium">{(financials[0].roe * 1)?.toFixed(2)}%</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">PE比率</p>
                                            <p className="font-medium">{financials[0].pe_ratio?.toFixed(2) || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">PB比率</p>
                                            <p className="font-medium">{financials[0].pb_ratio?.toFixed(2) || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">财务健康度</p>
                                            <p className={`font-medium ${getFinancialHealthColor(financials[0].financial_health_grade)}`}>
                                                {financials[0].financial_health_grade} ({financials[0].financial_health_score})
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* 财务数据标签页 */}
                    <TabsContent value="financials" className="space-y-6">
                        {financials && financials.length > 0 ? (
                            <>
                                {/* 财务指标概览卡片 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="text-center">
                                                <p className="text-sm text-muted-foreground">平均ROE</p>
                                                <p className="text-2xl font-bold text-green-600">
                                                    {((financials.reduce((sum, f) => sum + (f.roe || 0), 0) / financials.length) * 1)?.toFixed(2)}%
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="text-center">
                                                <p className="text-sm text-muted-foreground">平均毛利率</p>
                                                <p className="text-2xl font-bold text-blue-600">
                                                    {((financials.reduce((sum, f) => sum + (f.gross_margin || 0), 0) / financials.length) * 1)?.toFixed(2)}%
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="text-center">
                                                <p className="text-sm text-muted-foreground">平均净利率</p>
                                                <p className="text-2xl font-bold text-purple-600">
                                                    {((financials.reduce((sum, f) => sum + (f.net_margin || 0), 0) / financials.length) * 1)?.toFixed(2)}%
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="text-center">
                                                <p className="text-sm text-muted-foreground">平均负债率</p>
                                                <p className="text-2xl font-bold text-orange-600">
                                                    {((financials.reduce((sum, f) => sum + (f.debt_ratio || 0), 0) / financials.length) * 1)?.toFixed(2)}%
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="text-center">
                                                <p className="text-sm text-muted-foreground">营收增长率</p>
                                                <p className={`text-2xl font-bold ${
                                                    (financials[0].revenue_yoy || 0) > 0 ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                    {(financials[0].revenue_yoy || 0)?.toFixed(2)}%
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="text-center">
                                                <p className="text-sm text-muted-foreground">财务健康度</p>
                                                <p className={`text-2xl font-bold ${getFinancialHealthColor(financials[0].financial_health_grade)}`}>
                                                    {financials[0].financial_health_grade}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* 杜邦分析 */}
                                {financials[0] && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>杜邦分析</CardTitle>
                                            <CardDescription>
                                                净资产收益率(ROE) = 净利率 × 资产周转率 × 权益乘数
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                                <div className="text-center p-4 border rounded-lg bg-blue-50">
                                                    <p className="text-sm text-muted-foreground">净资产收益率</p>
                                                    <p className="text-xl font-bold text-blue-600 mt-1">
                                                        {(financials[0].roe * 1)?.toFixed(2)}%
                                                    </p>
                                                </div>
                                                <div className="text-center p-4 border rounded-lg bg-green-50">
                                                    <p className="text-sm text-muted-foreground">净利率</p>
                                                    <p className="text-xl font-bold text-green-600 mt-1">
                                                        {(financials[0].profit_margin * 1)?.toFixed(2)}%
                                                    </p>
                                                </div>
                                                <div className="text-center p-4 border rounded-lg bg-purple-50">
                                                    <p className="text-sm text-muted-foreground">资产周转率</p>
                                                    <p className="text-xl font-bold text-purple-600 mt-1">
                                                        {financials[0].asset_turnover?.toFixed(2)}
                                                    </p>
                                                </div>
                                                <div className="text-center p-4 border rounded-lg bg-orange-50">
                                                    <p className="text-sm text-muted-foreground">权益乘数</p>
                                                    <p className="text-xl font-bold text-orange-600 mt-1">
                                                        {financials[0].equity_multiplier?.toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="h-[200px] w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={[
                                                        {
                                                            name: '净利率',
                                                            value: (financials[0].profit_margin * 1) || 0,
                                                            fill: '#22c55e'
                                                        },
                                                        {
                                                            name: '资产周转率', 
                                                            value: (financials[0].asset_turnover * 1) || 0,
                                                            fill: '#8b5cf6'
                                                        },
                                                        {
                                                            name: '权益乘数',
                                                            value: (financials[0].equity_multiplier * 1) || 0,
                                                            fill: '#f97316'
                                                        }
                                                    ]}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                        <XAxis dataKey="name" />
                                                        <YAxis />
                                                        <Tooltip formatter={(value) => [value, '']} />
                                                        <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]}>
                                                            {[
                                                                {
                                                                    name: '净利率',
                                                                    value: (financials[0].profit_margin * 1) || 0,
                                                                    fill: '#22c55e'
                                                                },
                                                                {
                                                                    name: '资产周转率', 
                                                                    value: (financials[0].asset_turnover * 1) || 0,
                                                                    fill: '#8b5cf6'
                                                                },
                                                                {
                                                                    name: '权益乘数',
                                                                    value: (financials[0].equity_multiplier * 1) || 0,
                                                                    fill: '#f97316'
                                                                }
                                                            ].map((entry, index) => (
                                                                <Bar dataKey="value" fill={entry.fill} key={index} />
                                                            ))}
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* 现金流质量分析 */}
                                {financials[0] && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>现金流质量分析</CardTitle>
                                            <CardDescription>
                                                经营现金流质量评估
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                                <div className="text-center p-4 border rounded-lg">
                                                    <p className="text-sm text-muted-foreground">经营现金流/营业收入</p>
                                                    <p className={`text-lg font-bold mt-1 ${
                                                        (financials[0].ocf_to_or || 0) > 0.1 ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                        {((financials[0].ocf_to_or || 0) * 1)?.toFixed(2)}%
                                                    </p>
                                                </div>
                                                <div className="text-center p-4 border rounded-lg">
                                                    <p className="text-sm text-muted-foreground">经营现金流/营业利润</p>
                                                    <p className={`text-lg font-bold mt-1 ${
                                                        (financials[0].ocf_to_profit || 0) > 1 ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                        {((financials[0].ocf_to_profit || 0) * 1)?.toFixed(2)}
                                                    </p>
                                                </div>
                                                <div className="text-center p-4 border rounded-lg">
                                                    <p className="text-sm text-muted-foreground">现金流充足性</p>
                                                    <p className={`text-lg font-bold mt-1 ${
                                                        (financials[0].cash_flow_adequacy || 0) > 60 ? 'text-green-600' : 
                                                        (financials[0].cash_flow_adequacy || 0) > 30 ? 'text-yellow-600' : 'text-red-600'
                                                    }`}>
                                                        {financials[0].cash_flow_adequacy || 0}/100
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="text-center p-4 border rounded-lg bg-blue-50">
                                                    <p className="text-sm text-muted-foreground">经营现金流</p>
                                                    <p className={`text-lg font-bold mt-1 ${
                                                        (financials[0].operating_cash_flow || 0) > 0 ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                        {formatNumber(financials[0].operating_cash_flow)}
                                                    </p>
                                                </div>
                                                <div className="text-center p-4 border rounded-lg bg-green-50">
                                                    <p className="text-sm text-muted-foreground">投资现金流</p>
                                                    <p className={`text-lg font-bold mt-1 ${
                                                        (financials[0].investing_cash_flow || 0) > 0 ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                        {formatNumber(financials[0].investing_cash_flow)}
                                                    </p>
                                                </div>
                                                <div className="text-center p-4 border rounded-lg bg-purple-50">
                                                    <p className="text-sm text-muted-foreground">筹资现金流</p>
                                                    <p className={`text-lg font-bold mt-1 ${
                                                        (financials[0].financing_cash_flow || 0) > 0 ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                        {formatNumber(financials[0].financing_cash_flow)}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* 财务数据趋势分析 - 图表版 */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>营收与利润趋势</CardTitle>
                                        <CardDescription>
                                            营业收入 vs 净利润 (单位: 亿)
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-[300px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <ComposedChart data={chartFinancials}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                    <XAxis dataKey="report_date" tickFormatter={(val) => val.substring(0, 7)} />
                                                    <YAxis yAxisId="left" tickFormatter={(val) => (val / 100000000).toFixed(0)} />
                                                    <YAxis yAxisId="right" orientation="right" tickFormatter={(val) => (val * 1).toFixed(0) + '%'} />
                                                    <Tooltip 
                                                        formatter={(value: any, name: string) => {
                                                            if (name === '毛利率') return [(value * 1).toFixed(2) + '%', name];
                                                            return [(value / 100000000).toFixed(2) + '亿', name];
                                                        }}
                                                        labelFormatter={(label) => `报告期: ${label}`}
                                                    />
                                                    <Legend />
                                                    <Bar yAxisId="left" dataKey="revenue" name="营业收入" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                                    <Bar yAxisId="left" dataKey="net_income" name="净利润" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                                    <Line yAxisId="right" type="monotone" dataKey="gross_margin" name="毛利率" stroke="#f97316" strokeWidth={2} dot={{ r: 4 }} />
                                                </ComposedChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* 详细财务数据表格 */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>详细财务数据</CardTitle>
                                        <CardDescription>
                                            最近 {financials.length} 期完整财务数据
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>报告期</TableHead>
                                                        <TableHead>营业收入</TableHead>
                                                        <TableHead>净利润</TableHead>
                                                        <TableHead>毛利率</TableHead>
                                                        <TableHead>净利率</TableHead>
                                                        <TableHead>ROE</TableHead>
                                                        <TableHead>负债率</TableHead>
                                                        <TableHead>流动比率</TableHead>
                                                        <TableHead>速动比率</TableHead>
                                                        <TableHead>EPS</TableHead>
                                                        <TableHead>营收增长率</TableHead>
                                                        <TableHead>净利增长率</TableHead>
                                                        <TableHead>财务健康度</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {financials.map((financial, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell className="font-medium whitespace-nowrap">
                                                                {financial.report_date} ({financial.report_period})
                                                            </TableCell>
                                                            <TableCell>{formatNumber(financial.revenue)}</TableCell>
                                                            <TableCell>{formatNumber(financial.net_income)}</TableCell>
                                                            <TableCell>{(financial.gross_margin * 1)?.toFixed(2)}%</TableCell>
                                                            <TableCell>{(financial.net_margin * 1)?.toFixed(2)}%</TableCell>
                                                            <TableCell>{(financial.roe * 1)?.toFixed(2)}%</TableCell>
                                                            <TableCell>{(financial.debt_ratio * 1)?.toFixed(2)}%</TableCell>
                                                            <TableCell>{financial.current_ratio?.toFixed(2) || '-'}</TableCell>
                                                            <TableCell>{financial.quick_ratio?.toFixed(2) || '-'}</TableCell>
                                                            <TableCell>{financial.eps || '-'}</TableCell>
                                                            <TableCell className={getChangeColor(financial.revenue_yoy || 0)}>
                                                                {(financial.revenue_yoy || 0)?.toFixed(2)}%
                                                            </TableCell>
                                                            <TableCell className={getChangeColor(financial.net_income_yoy || 0)}>
                                                                {(financial.net_income_yoy || 0)?.toFixed(2)}%
                                                            </TableCell>
                                                            <TableCell>
                                                                <span className={getFinancialHealthColor(financial.financial_health_grade)}>
                                                                    {financial.financial_health_grade}
                                                                </span>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* 现金流分析 */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>现金流分析</CardTitle>
                                        <CardDescription>
                                            经营、投资、筹资现金流情况
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="text-center p-4 border rounded-lg">
                                                <p className="text-sm text-muted-foreground">经营现金流</p>
                                                <p className={`text-xl font-bold mt-2 ${
                                                    financials[0].operating_cash_flow > 0 ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                    {formatNumber(financials[0].operating_cash_flow)}
                                                </p>
                                            </div>
                                            <div className="text-center p-4 border rounded-lg">
                                                <p className="text-sm text-muted-foreground">投资现金流</p>
                                                <p className={`text-xl font-bold mt-2 ${
                                                    financials[0].investing_cash_flow > 0 ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                    {formatNumber(financials[0].investing_cash_flow)}
                                                </p>
                                            </div>
                                            <div className="text-center p-4 border rounded-lg">
                                                <p className="text-sm text-muted-foreground">筹资现金流</p>
                                                <p className={`text-xl font-bold mt-2 ${
                                                    financials[0].financing_cash_flow > 0 ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                    {formatNumber(financials[0].financing_cash_flow)}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        ) : (
                            <Card>
                                <CardContent className="p-6 text-center text-muted-foreground">
                                    暂无财务数据
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* 历史数据标签页 */}
                    <TabsContent value="historical" className="space-y-6">
                        {historical && historical.length > 0 ? (
                            <>
                                {/* 股价走势图 */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>股价走势</CardTitle>
                                        <CardDescription>
                                            最近 {historical.length} 个交易日收盘价走势
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-[300px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={chartHistorical}>
                                                    <defs>
                                                        <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                    <XAxis dataKey="date" tickFormatter={(val) => val.substring(5)} minTickGap={30} />
                                                    <YAxis domain={['auto', 'auto']} />
                                                    <Tooltip />
                                                    <Area type="monotone" dataKey="close" name="收盘价" stroke="#3b82f6" fillOpacity={1} fill="url(#colorClose)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>历史价格数据</CardTitle>
                                        <CardDescription>
                                            最近 {historical.length} 个交易日的数据
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>日期</TableHead>
                                                    <TableHead>开盘</TableHead>
                                                    <TableHead>最高</TableHead>
                                                    <TableHead>最低</TableHead>
                                                    <TableHead>收盘</TableHead>
                                                    <TableHead>涨跌额</TableHead>
                                                    <TableHead>涨跌幅</TableHead>
                                                    <TableHead>成交量</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {historical.map((day, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell className="font-medium">{day.date}</TableCell>
                                                        <TableCell>{formatPrice(day.open)}</TableCell>
                                                        <TableCell>{formatPrice(day.high)}</TableCell>
                                                        <TableCell>{formatPrice(day.low)}</TableCell>
                                                        <TableCell>{formatPrice(day.close)}</TableCell>
                                                        <TableCell className={getChangeColor(day.change)}>
                                                            {formatChange(day.change)}
                                                        </TableCell>
                                                        <TableCell className={getChangeColor(day.change_percent)}>
                                                            {formatChangePercent(day.change_percent)}
                                                        </TableCell>
                                                        <TableCell>{formatNumber(day.volume)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </>
                        ) : (
                            <Card>
                                <CardContent className="p-6 text-center text-muted-foreground">
                                    暂无历史数据
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* 技术指标标签页 */}
                    <TabsContent value="indicators" className="space-y-6">
                        {indicators ? (
                            <div className="grid gap-6">
                                {/* 这里可以添加技术指标图表和表格 */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>技术指标</CardTitle>
                                        <CardDescription>
                                            基于历史数据计算的技术指标
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-center text-muted-foreground py-8">
                                            技术指标图表待开发
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="p-6 text-center text-muted-foreground">
                                    暂无技术指标数据
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
