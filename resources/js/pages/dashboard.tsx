import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Users, Zap, Search, Shield, Download, Cpu } from 'lucide-react';

interface DashboardProps {
    user: {
        id: number;
        name: string;
        email: string;
        subscription?: {
            plan: string;
            status: string;
            expires_at: string;
        };
        today_usage?: number;
        remaining_queries?: number;
        daily_query_limit?: number;
    };
}

export default function Dashboard({ user }: DashboardProps) {
    const isLoggedIn = !!user;

    const getPlanBadge = (plan: string) => {
        const planConfig = {
            free: { label: '免费版', variant: 'secondary' as const, color: 'bg-gray-100 text-gray-800' },
            basic: { label: '基础版', variant: 'default' as const, color: 'bg-blue-100 text-blue-800' },
            pro: { label: '专业版', variant: 'outline' as const, color: 'bg-purple-100 text-purple-800' },
            enterprise: { label: '企业版', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
        };

        const config = planConfig[plan as keyof typeof planConfig] || planConfig.free;
        return <Badge variant={config.variant} className={config.color}>{config.label}</Badge>;
    };

    const getPlanFeatures = (plan: string) => {
        const features = {
            free: [
                { name: '每日3次查询', icon: Search },
                { name: '基础股票数据', icon: BarChart3 },
            ],
            basic: [
                { name: '每日50次查询', icon: Search },
                { name: '完整股票数据', icon: BarChart3 },
                { name: '财务指标分析', icon: TrendingUp },
            ],
            pro: [
                { name: '无限查询次数', icon: Search },
                { name: '高级技术指标', icon: BarChart3 },
                { name: 'AI分析功能', icon: Cpu },
                { name: '数据导出', icon: Download },
            ],
            enterprise: [
                { name: '无限查询次数', icon: Search },
                { name: '所有高级功能', icon: Zap },
                { name: 'API访问权限', icon: Shield },
                { name: '专属技术支持', icon: Users },
            ],
        };

        return features[plan as keyof typeof features] || features.free;
    };

    const currentPlan = user?.subscription?.plan || 'free';
    const features = getPlanFeatures(currentPlan);

    return (
        <AppLayout>
            <Head title="仪表板" />

            <div className="space-y-6">
                {/* 欢迎区域 */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">欢迎回来，{user.name}！</h1>
                        <p className="text-muted-foreground mt-1">
                            这里是您的AI股票分析中心
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {getPlanBadge(currentPlan)}
                        <Button asChild variant="outline" size="sm">
                            <Link href="/stocks">探索股票</Link>
                        </Button>
                    </div>
                </div>

                {/* 使用统计 */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">今日查询次数</CardTitle>
                            <Search className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{user.today_usage || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                剩余 {user.remaining_queries || 0} 次查询
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">每日限额</CardTitle>
                            <Zap className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{user.daily_query_limit || 3}</div>
                            <p className="text-xs text-muted-foreground">
                                {currentPlan === 'free' ? '免费用户' : '会员用户'}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">订阅状态</CardTitle>
                            <Shield className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold capitalize">{currentPlan}</div>
                            <p className="text-xs text-muted-foreground">
                                {user?.subscription?.status === 'active' ? '活跃中' : '已过期'}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">功能权限</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{features.length}</div>
                            <p className="text-xs text-muted-foreground">
                                可用功能数量
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* 快速操作和功能概览 */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                    {/* 快速操作 */}
                    <Card className="lg:col-span-4">
                        <CardHeader>
                            <CardTitle>快速操作</CardTitle>
                            <CardDescription>
                                立即开始您的股票分析之旅
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Button asChild className="h-auto p-4">
                                        <Link href="/stocks">
                                            <div className="flex items-center gap-3">
                                                <BarChart3 className="h-6 w-6" />
                                                <div className="text-left">
                                                    <div className="font-semibold">股票列表</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        浏览所有股票
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" className="h-auto p-4">
                                        <Link href="#">
                                            <div className="flex items-center gap-3">
                                                <TrendingUp className="h-6 w-6" />
                                                <div className="text-left">
                                                    <div className="font-semibold">热门股票</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        查看热门标的
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Button asChild variant="outline" className="h-auto p-4">
                                        <Link href="#">
                                            <div className="flex items-center gap-3">
                                                <Cpu className="h-6 w-6" />
                                                <div className="text-left">
                                                    <div className="font-semibold">AI分析</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        智能投资建议
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" className="h-auto p-4">
                                        <Link href="#">
                                            <div className="flex items-center gap-3">
                                                <Download className="h-6 w-6" />
                                                <div className="text-left">
                                                    <div className="font-semibold">数据导出</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        导出分析报告
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 当前计划功能 */}
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle>当前计划功能</CardTitle>
                            <CardDescription>
                                {getPlanBadge(currentPlan)} 包含的功能
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {features.map((feature, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                            <feature.icon className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{feature.name}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {currentPlan === 'free' && (
                                <div className="mt-6">
                                    <Button asChild className="w-full">
                                        <Link href="#">升级会员</Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* 使用提示 */}
                <Card>
                    <CardHeader>
                        <CardTitle>使用提示</CardTitle>
                        <CardDescription>
                            充分利用AI股票分析平台的功能
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <div className="space-y-2">
                                <h4 className="font-medium">🔍 搜索股票</h4>
                                <p className="text-sm text-muted-foreground">
                                    使用股票代码或名称快速查找您关注的股票
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-medium">📊 分析财务</h4>
                                <p className="text-sm text-muted-foreground">
                                    查看完整的财务指标和财务健康度评分
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-medium">📈 技术分析</h4>
                                <p className="text-sm text-muted-foreground">
                                    使用多种技术指标进行深入的技术分析
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
