import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Search, Filter, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

interface FinancialAnalysisProps {
    stocks: any[];
    filters: {
        search?: string;
        market?: string;
        industry?: string;
        min_roe?: number;
        max_roe?: number;
        min_gross_margin?: number;
        max_gross_margin?: number;
        min_pe_ratio?: number;
        max_pe_ratio?: number;
        min_pb_ratio?: number;
        max_pb_ratio?: number;
        financial_health?: string;
    };
    remaining_queries: number;
    daily_limit: number;
}

export default function FinancialAnalysis({ stocks, filters, remaining_queries, daily_limit }: FinancialAnalysisProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [market, setMarket] = useState(filters.market || '');
    const [industry, setIndustry] = useState(filters.industry || '');
    const [minRoe, setMinRoe] = useState(filters.min_roe || 0);
    const [maxRoe, setMaxRoe] = useState(filters.max_roe || 50);
    const [minGrossMargin, setMinGrossMargin] = useState(filters.min_gross_margin || 0);
    const [maxGrossMargin, setMaxGrossMargin] = useState(filters.max_gross_margin || 100);
    const [minPeRatio, setMinPeRatio] = useState(filters.min_pe_ratio || 0);
    const [maxPeRatio, setMaxPeRatio] = useState(filters.max_pe_ratio || 100);
    const [minPbRatio, setMinPbRatio] = useState(filters.min_pb_ratio || 0);
    const [maxPbRatio, setMaxPbRatio] = useState(filters.max_pb_ratio || 10);
    const [financialHealth, setFinancialHealth] = useState(filters.financial_health || '');
    const [loading, setLoading] = useState(false);

    // 防抖搜索
    useEffect(() => {
        const timer = setTimeout(() => {
            router.get('/financial-analysis', {
                search: search || undefined,
                market: market || undefined,
                industry: industry || undefined,
                min_roe: minRoe,
                max_roe: maxRoe,
                min_gross_margin: minGrossMargin,
                max_gross_margin: maxGrossMargin,
                min_pe_ratio: minPeRatio,
                max_pe_ratio: maxPeRatio,
                min_pb_ratio: minPbRatio,
                max_pb_ratio: maxPbRatio,
                financial_health: financialHealth || undefined,
            }, {
                preserveState: true,
                replace: true,
                onStart: () => setLoading(true),
                onFinish: () => setLoading(false),
            });
        }, 500);

        return () => clearTimeout(timer);
    }, [
        search, market, industry, minRoe, maxRoe, minGrossMargin, maxGrossMargin,
        minPeRatio, maxPeRatio, minPbRatio, maxPbRatio, financialHealth
    ]);

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

    const getFinancialHealthColor = (grade: string) => {
        const colorMap = {
            '优秀': 'text-green-600 bg-green-100',
            '良好': 'text-blue-600 bg-blue-100',
            '一般': 'text-yellow-600 bg-yellow-100',
            '较差': 'text-red-600 bg-red-100',
        };
        return colorMap[grade as keyof typeof colorMap] || 'text-gray-600 bg-gray-100';
    };

    const formatNumber = (num: number) => {
        if (num >= 100000000) {
            return (num / 100000000).toFixed(2) + '亿';
        } else if (num >= 10000) {
            return (num / 10000).toFixed(2) + '万';
        }
        return num.toFixed(2);
    };

    const formatPercent = (value: number) => {
        return (value * 100).toFixed(2) + '%';
    };

    return (
        <AppLayout>
            <Head title="财务分析" />

            <div className="space-y-6">
                {/* 页面标题和统计 */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">财务分析</h1>
                        <p className="text-muted-foreground mt-1">
                            基于财务指标的高级股票筛选和分析
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-muted-foreground">
                            今日剩余查询: <span className="font-semibold">{remaining_queries}</span> / {daily_limit}
                        </div>
                        <Button asChild>
                            <Link href="/stocks">返回股票列表</Link>
                        </Button>
                    </div>
                </div>

                {/* 筛选器 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            高级筛选
                        </CardTitle>
                        <CardDescription>
                            根据财务指标筛选优质股票
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* 基本筛选 */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">搜索股票</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="股票代码或名称..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block">市场</label>
                                    <Select value={market} onValueChange={setMarket}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="选择市场" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">全部市场</SelectItem>
                                            <SelectItem value="SH">上海证券交易所</SelectItem>
                                            <SelectItem value="SZ">深圳证券交易所</SelectItem>
                                            <SelectItem value="HK">香港交易所</SelectItem>
                                            <SelectItem value="US">美国交易所</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block">行业</label>
                                    <Select value={industry} onValueChange={setIndustry}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="选择行业" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">全部行业</SelectItem>
                                            <SelectItem value="银行">银行</SelectItem>
                                            <SelectItem value="证券">证券</SelectItem>
                                            <SelectItem value="保险">保险</SelectItem>
                                            <SelectItem value="科技">科技</SelectItem>
                                            <SelectItem value="医药">医药</SelectItem>
                                            <SelectItem value="消费">消费</SelectItem>
                                            <SelectItem value="能源">能源</SelectItem>
                                            <SelectItem value="制造">制造</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* 盈利能力筛选 */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">
                                        ROE ({minRoe}% - {maxRoe}%)
                                    </label>
                                    <Slider
                                        value={[minRoe, maxRoe]}
                                        min={0}
                                        max={50}
                                        step={1}
                                        onValueChange={([min, max]) => {
                                            setMinRoe(min);
                                            setMaxRoe(max);
                                        }}
                                        className="my-4"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block">
                                        毛利率 ({minGrossMargin}% - {maxGrossMargin}%)
                                    </label>
                                    <Slider
                                        value={[minGrossMargin, maxGrossMargin]}
                                        min={0}
                                        max={100}
                                        step={1}
                                        onValueChange={([min, max]) => {
                                            setMinGrossMargin(min);
                                            setMaxGrossMargin(max);
                                        }}
                                        className="my-4"
                                    />
                                </div>
                            </div>

                            {/* 估值指标筛选 */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">
                                        PE比率 ({minPeRatio} - {maxPeRatio})
                                    </label>
                                    <Slider
                                        value={[minPeRatio, maxPeRatio]}
                                        min={0}
                                        max={100}
                                        step={1}
                                        onValueChange={([min, max]) => {
                                            setMinPeRatio(min);
                                            setMaxPeRatio(max);
                                        }}
                                        className="my-4"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block">
                                        PB比率 ({minPbRatio} - {maxPbRatio})
                                    </label>
                                    <Slider
                                        value={[minPbRatio, maxPbRatio]}
                                        min={0}
                                        max={10}
                                        step={0.1}
                                        onValueChange={([min, max]) => {
                                            setMinPbRatio(min);
                                            setMaxPbRatio(max);
                                        }}
                                        className="my-4"
                                    />
                                </div>
                            </div>

                            {/* 其他筛选 */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">财务健康度</label>
                                    <Select value={financialHealth} onValueChange={setFinancialHealth}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="选择健康度" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">全部</SelectItem>
                                            <SelectItem value="优秀">优秀</SelectItem>
                                            <SelectItem value="良好">良好</SelectItem>
                                            <SelectItem value="一般">一般</SelectItem>
                                            <SelectItem value="较差">较差</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="pt-4">
                                    <Button 
                                        variant="outline" 
                                        onClick={() => {
                                            setSearch('');
                                            setMarket('');
                                            setIndustry('');
                                            setMinRoe(0);
                                            setMaxRoe(50);
                                            setMinGrossMargin(0);
                                            setMaxGrossMargin(100);
                                            setMinPeRatio(0);
                                            setMaxPeRatio(100);
                                            setMinPbRatio(0);
                                            setMaxPbRatio(10);
                                            setFinancialHealth('');
                                        }}
                                        className="w-full"
                                    >
                                        重置筛选条件
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 结果统计 */}
                {stocks.length > 0 && (
                    <Card>
                        <CardContent className="p-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">平均ROE</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {formatPercent(stocks.reduce((sum, stock) => sum + (stock.latest_financial?.roe || 0), 0) / stocks.length)}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">平均毛利率</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {formatPercent(stocks.reduce((sum, stock) => sum + (stock.latest_financial?.gross_margin || 0), 0) / stocks.length)}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">平均PE</p>
                                    <p className="text-2xl font-bold text-purple-600">
                                        {(stocks.reduce((sum, stock) => sum + (stock.latest_financial?.pe_ratio || 0), 0) / stocks.length).toFixed(2)}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">筛选结果</p>
                                    <p className="text-2xl font-bold text-orange-600">
                                        {stocks.length} 只股票
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* 股票列表 */}
                <Card>
                    <CardHeader>
                        <CardTitle>筛选结果</CardTitle>
                        <CardDescription>
                            {stocks.length > 0 ? `找到 ${stocks.length} 只符合筛选条件的股票` : '暂无符合筛选条件的股票'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8 text-muted-foreground">
                                正在加载...
                            </div>
                        ) : stocks.length > 0 ? (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>股票代码</TableHead>
                                            <TableHead>股票名称</TableHead>
                                            <TableHead>市场</TableHead>
                                            <TableHead>行业</TableHead>
                                            <TableHead className="text-right">ROE</TableHead>
                                            <TableHead className="text-right">毛利率</TableHead>
                                            <TableHead className="text-right">净利率</TableHead>
                                            <TableHead className="text-right">PE</TableHead>
                                            <TableHead className="text-right">PB</TableHead>
                                            <TableHead className="text-right">营业收入</TableHead>
                                            <TableHead className="text-right">净利润</TableHead>
                                            <TableHead>财务健康度</TableHead>
                                            <TableHead className="text-right">操作</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {stocks.map((stock) => (
                                            <TableRow key={stock.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        {getMarketBadge(stock.market)}
                                                        <span>{stock.symbol}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{stock.name}</TableCell>
                                                <TableCell>
                                                    {getMarketBadge(stock.market)}
                                                </TableCell>
                                                <TableCell>
                                                    {stock.industry || '-'}
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {stock.latest_financial?.roe ? formatPercent(stock.latest_financial.roe) : '-'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {stock.latest_financial?.gross_margin ? formatPercent(stock.latest_financial.gross_margin) : '-'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {stock.latest_financial?.net_margin ? formatPercent(stock.latest_financial.net_margin) : '-'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {stock.latest_financial?.pe_ratio?.toFixed(2) || '-'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {stock.latest_financial?.pb_ratio?.toFixed(2) || '-'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {stock.latest_financial?.revenue ? formatNumber(stock.latest_financial.revenue) : '-'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {stock.latest_financial?.net_income ? formatNumber(stock.latest_financial.net_income) : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {stock.latest_financial?.financial_health_grade ? (
                                                        <Badge variant="outline" className={getFinancialHealthColor(stock.latest_financial.financial_health_grade)}>
                                                            {stock.latest_financial.financial_health_grade}
                                                        </Badge>
                                                    ) : (
                                                        '-'
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button asChild variant="outline" size="sm">
                                                        <Link href={`/stocks/${stock.symbol}`}>
                                                            查看详情
                                                        </Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>暂无符合筛选条件的股票</p>
                                <p className="text-sm mt-2">请调整筛选条件后重试</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
