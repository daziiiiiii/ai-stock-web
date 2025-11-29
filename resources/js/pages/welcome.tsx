import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowRight,
    BarChart3,
    Minus,
    Search,
    Shield,
    Star,
    TrendingDown,
    TrendingUp,
    Users,
    Zap,
} from 'lucide-react';
import { useState } from 'react';

interface Stock {
    symbol: string;
    name: string;
    market: string;
    latest_daily_data?: {
        close: number;
        change: number;
        change_percent: number;
    };
}

interface WelcomeProps {
    canRegister?: boolean;
    popularStocks?: Stock[];
    auth?: {
        user?: any;
    };
}

export default function Welcome({
    canRegister = true,
    popularStocks = [],
    auth,
}: WelcomeProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setLoading(true);
            // 这里可以添加搜索逻辑
            router.get(`/stocks?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    const getMarketBadge = (market: string) => {
        const marketConfig = {
            SH: { label: '沪市', variant: 'destructive' as const },
            SZ: { label: '深市', variant: 'default' as const },
            HK: { label: '港股', variant: 'outline' as const },
            US: { label: '美股', variant: 'secondary' as const },
        };

        const config = marketConfig[market as keyof typeof marketConfig] || {
            label: market,
            variant: 'default' as const,
        };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const getChangeIcon = (change: number) => {
        if (change > 0) return <TrendingUp className="h-4 w-4 text-red-500" />;
        if (change < 0)
            return <TrendingDown className="h-4 w-4 text-green-500" />;
        return <Minus className="h-4 w-4 text-gray-500" />;
    };

    const getChangeColor = (change: number) => {
        if (change > 0) return 'text-red-500';
        if (change < 0) return 'text-green-500';
        return 'text-gray-500';
    };

    const formatPrice = (price: number) => {
        return price;
    };

    const formatChange = (change: number) => {
        return change > 0 ? `+${change}` : change;
    };

    const formatChangePercent = (percent: number) => {
        return percent > 0
            ? `+${percent}%`
            : `${percent}%`;
    };

    return (
        <>
            <Head title="AI股票分析平台 - 专业的股票数据分析工具">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900">
                {/* 导航栏 */}
                <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/80">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                <span className="text-xl font-bold text-gray-900 dark:text-white">
                                    AI股票分析
                                </span>
                            </div>
                            <nav className="flex items-center space-x-4">
                                {auth?.user ? (
                                    <div className="flex items-center space-x-4">
                                        <Link
                                            href="/dashboard"
                                            className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                                        >
                                            控制台
                                        </Link>
                                        <Link
                                            href="/stocks"
                                            className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                                        >
                                            股票列表
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-4">
                                        <Link
                                            href="/login"
                                            className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                                        >
                                            登录
                                        </Link>
                                        {canRegister && (
                                            <Link
                                                href="/register"
                                                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                            >
                                                免费注册
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </nav>
                        </div>
                    </div>
                </header>

                {/* 主要内容 */}
                <main className="container mx-auto px-4 py-12">
                    {/* 英雄区域 */}
                    <div className="mb-16 text-center">
                        <h1 className="mb-6 text-4xl font-bold text-gray-900 md:text-6xl dark:text-white">
                            专业的AI股票
                            <span className="text-blue-600 dark:text-blue-400">
                                分析平台
                            </span>
                        </h1>
                        <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600 dark:text-gray-300">
                            基于人工智能技术，为您提供深度股票分析、财务指标评估和技术指标计算，助力投资决策
                        </p>

                        {/* 搜索框 */}
                        <div className="mx-auto mb-12 max-w-2xl">
                            <form onSubmit={handleSearch} className="relative">
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                                    <Input
                                        type="text"
                                        placeholder="搜索股票代码或名称，例如：000001、贵州茅台..."
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        className="border-2 border-gray-300 py-6 pr-32 pl-12 text-lg focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800"
                                    />
                                    <Button
                                        type="submit"
                                        className="absolute top-1/2 right-2 -translate-y-1/2 transform"
                                        disabled={loading}
                                    >
                                        {loading ? '搜索中...' : '搜索股票'}
                                    </Button>
                                </div>
                            </form>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                免费用户每日可查询3次，注册后享受更多功能
                            </p>
                        </div>

                        {/* 快速访问按钮 */}
                        <div className="flex flex-wrap justify-center gap-4">
                            <Button asChild variant="outline" size="lg">
                                <Link href="/dashboard">
                                    开始体验
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button asChild size="lg">
                                <Link href="/register">
                                    免费注册
                                    <Star className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* 热门股票展示 */}
                    <section className="mb-16">
                        <h2 className="mb-8 text-center text-3xl font-bold text-gray-900 dark:text-white">
                            热门股票
                        </h2>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {popularStocks.length > 0
                                ? popularStocks.map((stock, index) => (
                                      <Card
                                          key={index}
                                          className="transition-shadow hover:shadow-lg"
                                      >
                                          <CardContent className="p-4">
                                              <div className="mb-2 flex items-center justify-between">
                                                  <div className="flex items-center space-x-2">
                                                      {getMarketBadge(
                                                          stock.market,
                                                      )}
                                                      <span className="font-semibold text-gray-900 dark:text-white">
                                                          {stock.symbol}
                                                      </span>
                                                  </div>
                                                  <span className="text-sm text-gray-600 dark:text-gray-300">
                                                      {stock.name}
                                                  </span>
                                              </div>
                                              {stock.latest_daily_data && (
                                                  <div className="space-y-2">
                                                      <div className="flex items-center justify-between">
                                                          <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                                              {formatPrice(
                                                                  stock
                                                                      .latest_daily_data
                                                                      .close,
                                                              )}
                                                          </span>
                                                          <div
                                                              className={`flex items-center space-x-1 ${getChangeColor(stock.latest_daily_data.change)}`}
                                                          >
                                                              {getChangeIcon(
                                                                  stock
                                                                      .latest_daily_data
                                                                      .change,
                                                              )}
                                                              <span className="font-semibold">
                                                                  {formatChange(
                                                                      stock
                                                                          .latest_daily_data
                                                                          .change,
                                                                  )}
                                                              </span>
                                                          </div>
                                                      </div>
                                                      <div
                                                          className={`text-sm font-medium ${getChangeColor(stock.latest_daily_data.change_percent)}`}
                                                      >
                                                          {formatChangePercent(
                                                              stock
                                                                  .latest_daily_data
                                                                  .change_percent,
                                                          )}
                                                      </div>
                                                  </div>
                                              )}
                                          </CardContent>
                                      </Card>
                                  ))
                                : // 占位数据
                                  [...Array(4)].map((_, index) => (
                                      <Card
                                          key={index}
                                          className="transition-shadow hover:shadow-lg"
                                      >
                                          <CardContent className="p-4">
                                              <div className="animate-pulse">
                                                  <div className="mb-2 flex items-center justify-between">
                                                      <div className="flex items-center space-x-2">
                                                          <div className="h-6 w-12 rounded bg-gray-200"></div>
                                                          <div className="h-4 w-16 rounded bg-gray-200"></div>
                                                      </div>
                                                      <div className="h-4 w-20 rounded bg-gray-200"></div>
                                                  </div>
                                                  <div className="space-y-2">
                                                      <div className="flex justify-between">
                                                          <div className="h-6 w-16 rounded bg-gray-200"></div>
                                                          <div className="h-6 w-12 rounded bg-gray-200"></div>
                                                      </div>
                                                      <div className="h-4 w-20 rounded bg-gray-200"></div>
                                                  </div>
                                              </div>
                                          </CardContent>
                                      </Card>
                                  ))}
                        </div>
                    </section>

                    {/* 功能介绍 */}
                    <section className="mb-16">
                        <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white">
                            核心功能
                        </h2>
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                            <Card className="text-center">
                                <CardHeader>
                                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                                        <BarChart3 className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <CardTitle>基本面分析</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-base">
                                        30+个财务指标深度分析，财务健康度评分，帮助您全面了解公司基本面
                                    </CardDescription>
                                </CardContent>
                            </Card>

                            <Card className="text-center">
                                <CardHeader>
                                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                        <TrendingUp className="h-6 w-6 text-green-600" />
                                    </div>
                                    <CardTitle>技术指标</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-base">
                                        MA、MACD、RSI、KDJ、布林带等多种技术指标，支持专业的技术分析
                                    </CardDescription>
                                </CardContent>
                            </Card>

                            <Card className="text-center">
                                <CardHeader>
                                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                                        <Zap className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <CardTitle>AI智能分析</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-base">
                                        基于人工智能算法，提供智能投资建议和风险评估
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        </div>
                    </section>

                    {/* 会员计划 */}
                    <section className="mb-16">
                        <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white">
                            会员计划
                        </h2>
                        <Tabs defaultValue="free" className="mx-auto max-w-4xl">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="free">免费版</TabsTrigger>
                                <TabsTrigger value="basic">基础版</TabsTrigger>
                                <TabsTrigger value="pro">专业版</TabsTrigger>
                                <TabsTrigger value="enterprise">
                                    企业版
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="free">
                                <Card>
                                    <CardHeader className="text-center">
                                        <CardTitle className="text-2xl">
                                            免费版
                                        </CardTitle>
                                        <CardDescription>
                                            适合初学者体验
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="text-center">
                                            <span className="text-3xl font-bold">
                                                ¥0
                                            </span>
                                            <span className="text-gray-600 dark:text-gray-400">
                                                /月
                                            </span>
                                        </div>
                                        <ul className="space-y-2">
                                            <li className="flex items-center">
                                                <Search className="mr-2 h-4 w-4 text-green-500" />
                                                每日3次查询
                                            </li>
                                            <li className="flex items-center">
                                                <BarChart3 className="mr-2 h-4 w-4 text-green-500" />
                                                基础股票数据
                                            </li>
                                        </ul>
                                        <Button asChild className="w-full">
                                            <Link href="/register">
                                                立即开始
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="basic">
                                <Card>
                                    <CardHeader className="text-center">
                                        <CardTitle className="text-2xl">
                                            基础版
                                        </CardTitle>
                                        <CardDescription>
                                            适合个人投资者
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="text-center">
                                            <span className="text-3xl font-bold">
                                                ¥29
                                            </span>
                                            <span className="text-gray-600 dark:text-gray-400">
                                                /月
                                            </span>
                                        </div>
                                        <ul className="space-y-2">
                                            <li className="flex items-center">
                                                <Search className="mr-2 h-4 w-4 text-green-500" />
                                                每日50次查询
                                            </li>
                                            <li className="flex items-center">
                                                <BarChart3 className="mr-2 h-4 w-4 text-green-500" />
                                                完整股票数据
                                            </li>
                                            <li className="flex items-center">
                                                <TrendingUp className="mr-2 h-4 w-4 text-green-500" />
                                                财务指标分析
                                            </li>
                                        </ul>
                                        <Button
                                            asChild
                                            variant="outline"
                                            className="w-full"
                                        >
                                            <Link href="/register">
                                                升级会员
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="pro">
                                <Card>
                                    <CardHeader className="text-center">
                                        <CardTitle className="text-2xl">
                                            专业版
                                        </CardTitle>
                                        <CardDescription>
                                            适合专业投资者
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="text-center">
                                            <span className="text-3xl font-bold">
                                                ¥99
                                            </span>
                                            <span className="text-gray-600 dark:text-gray-400">
                                                /月
                                            </span>
                                        </div>
                                        <ul className="space-y-2">
                                            <li className="flex items-center">
                                                <Search className="mr-2 h-4 w-4 text-green-500" />
                                                无限查询次数
                                            </li>
                                            <li className="flex items-center">
                                                <BarChart3 className="mr-2 h-4 w-4 text-green-500" />
                                                高级技术指标
                                            </li>
                                            <li className="flex items-center">
                                                <Zap className="mr-2 h-4 w-4 text-green-500" />
                                                AI分析功能
                                            </li>
                                        </ul>
                                        <Button
                                            asChild
                                            variant="outline"
                                            className="w-full"
                                        >
                                            <Link href="/register">
                                                升级会员
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="enterprise">
                                <Card>
                                    <CardHeader className="text-center">
                                        <CardTitle className="text-2xl">
                                            企业版
                                        </CardTitle>
                                        <CardDescription>
                                            适合机构用户
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="text-center">
                                            <span className="text-3xl font-bold">
                                                ¥299
                                            </span>
                                            <span className="text-gray-600 dark:text-gray-400">
                                                /月
                                            </span>
                                        </div>
                                        <ul className="space-y-2">
                                            <li className="flex items-center">
                                                <Search className="mr-2 h-4 w-4 text-green-500" />
                                                无限查询次数
                                            </li>
                                            <li className="flex items-center">
                                                <Shield className="mr-2 h-4 w-4 text-green-500" />
                                                API访问权限
                                            </li>
                                            <li className="flex items-center">
                                                <Users className="mr-2 h-4 w-4 text-green-500" />
                                                专属技术支持
                                            </li>
                                        </ul>
                                        <Button
                                            asChild
                                            variant="outline"
                                            className="w-full"
                                        >
                                            <Link href="/register">
                                                联系销售
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </section>
                </main>

                {/* 页脚 */}
                <footer className="border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
                    <div className="container mx-auto px-4 py-8">
                        <div className="flex flex-col items-center justify-between md:flex-row">
                            <div className="mb-4 flex items-center space-x-2 md:mb-0">
                                <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                <span className="text-lg font-bold text-gray-900 dark:text-white">
                                    AI股票分析
                                </span>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                © 2025 AI股票分析平台. 保留所有权利.
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
