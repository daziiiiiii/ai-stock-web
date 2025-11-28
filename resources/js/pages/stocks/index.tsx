import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Stock {
    id: number;
    symbol: string;
    name: string;
    market: string;
    industry: string | null;
    status: string;
    list_date: string | null;
    latest_daily_data?: {
        close: number;
        change: number;
        change_percent: number;
    };
}

interface StocksPageProps {
    stocks: {
        data: Stock[];
        meta: {
            current_page: number;
            last_page: number;
            per_page: number;
            total: number;
        };
    };
    filters: {
        search?: string;
        market?: string;
        industry?: string;
    };
    remaining_queries: number;
    daily_limit: number;
}

export default function StocksIndex({ stocks, filters, remaining_queries, daily_limit }: StocksPageProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [market, setMarket] = useState(filters.market || '');
    const [industry, setIndustry] = useState(filters.industry || '');
    const [loading, setLoading] = useState(false);

    // 防抖搜索
    useEffect(() => {
        const timer = setTimeout(() => {
            router.get('/stocks', {
                search: search || undefined,
                market: market || undefined,
                industry: industry || undefined,
            }, {
                preserveState: true,
                replace: true,
                onStart: () => setLoading(true),
                onFinish: () => setLoading(false),
            });
        }, 500);

        return () => clearTimeout(timer);
    }, [search, market, industry]);

    const handlePageChange = (page: number) => {
        router.get('/stocks', {
            page,
            search: search || undefined,
            market: market || undefined,
            industry: industry || undefined,
        });
    };

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
        return price.toFixed(2);
    };

    const formatChange = (change: number) => {
        return change > 0 ? `+${change.toFixed(2)}` : change.toFixed(2);
    };

    const formatChangePercent = (percent: number) => {
        return percent > 0 ? `+${percent.toFixed(2)}%` : `${percent.toFixed(2)}%`;
    };

    return (
        <AppLayout>
            <Head title="股票列表" />

            <div className="space-y-6">
                {/* 页面标题和统计 */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">股票列表</h1>
                        <p className="text-muted-foreground mt-1">
                            探索A股、港股、美股等市场的股票信息
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-muted-foreground">
                            今日剩余查询: <span className="font-semibold">{remaining_queries}</span> / {daily_limit}
                        </div>
                        <Button asChild>
                            <Link href="/dashboard">返回仪表板</Link>
                        </Button>
                    </div>
                </div>

                {/* 查询额度提示 */}
                {remaining_queries <= 3 && (
                    <Card className={remaining_queries === 0 ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'}>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">
                                        {remaining_queries === 0 
                                            ? '今日查询次数已用完' 
                                            : `今日仅剩 ${remaining_queries} 次查询`}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {remaining_queries === 0 
                                            ? '请升级会员或明日再试' 
                                            : '升级会员可享受更多查询次数'}
                                    </p>
                                </div>
                                {remaining_queries === 0 && (
                                    <Button variant="outline" size="sm">
                                        升级会员
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* 筛选器 */}
                <Card>
                    <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* 搜索框 */}
                            <div className="md:col-span-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="搜索股票代码或名称..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            {/* 市场筛选 */}
                            <div>
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

                            {/* 行业筛选 */}
                            <div>
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
                    </CardContent>
                </Card>

                {/* 股票列表 */}
                <Card>
                    <CardHeader>
                        <CardTitle>股票列表</CardTitle>
                        <CardDescription>
                            共 {stocks.meta.total} 只股票，第 {stocks.meta.current_page} 页 / 共 {stocks.meta.last_page} 页
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            // 加载骨架屏
                            <div className="space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="flex items-center space-x-4">
                                        <Skeleton className="h-12 w-12 rounded-full" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-[250px]" />
                                            <Skeleton className="h-4 w-[200px]" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>股票代码</TableHead>
                                            <TableHead>股票名称</TableHead>
                                            <TableHead>市场</TableHead>
                                            <TableHead>行业</TableHead>
                                            <TableHead className="text-right">最新价</TableHead>
                                            <TableHead className="text-right">涨跌额</TableHead>
                                            <TableHead className="text-right">涨跌幅</TableHead>
                                            <TableHead className="text-right">操作</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {stocks.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                                    暂无股票数据
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            stocks.data.map((stock) => (
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
                                                        {stock.latest_daily_data ? (
                                                            formatPrice(stock.latest_daily_data.close)
                                                        ) : (
                                                            '-'
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {stock.latest_daily_data ? (
                                                            <div className={`flex items-center justify-end gap-1 ${getChangeColor(stock.latest_daily_data.change)}`}>
                                                                {getChangeIcon(stock.latest_daily_data.change)}
                                                                {formatChange(stock.latest_daily_data.change)}
                                                            </div>
                                                        ) : (
                                                            '-'
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {stock.latest_daily_data ? (
                                                            <span className={getChangeColor(stock.latest_daily_data.change_percent)}>
                                                                {formatChangePercent(stock.latest_daily_data.change_percent)}
                                                            </span>
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
                                            ))
                                        )}
                                    </TableBody>
                                </Table>

                                {/* 分页 */}
                                {stocks.meta.last_page > 1 && (
                                    <div className="mt-6">
                                        <Pagination>
                                            <PaginationContent>
                                                <PaginationItem>
                                                    <PaginationPrevious
                                                        href="#"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            if (stocks.meta.current_page > 1) {
                                                                handlePageChange(stocks.meta.current_page - 1);
                                                            }
                                                        }}
                                                        className={stocks.meta.current_page === 1 ? 'pointer-events-none opacity-50' : ''}
                                                    />
                                                </PaginationItem>

                                                {[...Array(stocks.meta.last_page)].map((_, i) => (
                                                    <PaginationItem key={i + 1}>
                                                        <PaginationLink
                                                            href="#"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handlePageChange(i + 1);
                                                            }}
                                                            isActive={stocks.meta.current_page === i + 1}
                                                        >
                                                            {i + 1}
                                                        </PaginationLink>
                                                    </PaginationItem>
                                                ))}

                                                <PaginationItem>
                                                    <PaginationNext
                                                        href="#"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            if (stocks.meta.current_page < stocks.meta.last_page) {
                                                                handlePageChange(stocks.meta.current_page + 1);
                                                            }
                                                        }}
                                                        className={stocks.meta.current_page === stocks.meta.last_page ? 'pointer-events-none opacity-50' : ''}
                                                    />
                                                </PaginationItem>
                                            </PaginationContent>
                                        </Pagination>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
