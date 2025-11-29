import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatPrice, formatChange, formatChangePercent, formatNumber, getChangeColor, getChangeIcon, getMarketBadge } from './utils';

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

interface OverviewProps {
    stock: Stock;
    realtime: RealtimeData;
    financials: FinancialData[];
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

export default function Overview({ stock, realtime, financials }: OverviewProps) {
    const marketConfig = getMarketBadge(stock.market);

    return (
        <div className="space-y-6">
            {/* 基本信息 */}
            <Card>
                <CardHeader>
                    <CardTitle>基本信息</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {financials && financials.length > 0 && financials[0].grossprofit_margin && (
                            <div>
                                <p className="text-sm text-muted-foreground">毛利率</p>
                                <p className="font-medium">{(financials[0].grossprofit_margin)}%</p>
                            </div>
                        )}
                        <div>
                            <p className="text-sm text-muted-foreground">股票名称</p>
                            <p className="font-medium">{stock.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">市场</p>
                            <p className="font-medium">
                                <Badge variant={marketConfig.variant}>{marketConfig.label}</Badge>
                            </p>
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
                                <p className="text-sm text-muted-foreground">每股收益</p>
                                <p className="font-medium">{financials[0].eps || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">稀释每股收益</p>
                                <p className="font-medium">{financials[0].dt_eps || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">毛利率</p>
                                <p className="font-medium">{(financials[0].grossprofit_margin)}%</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">ROE</p>
                                <p className="font-medium">{(financials[0].roe)}%</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">资产负债率</p>
                                <p className="font-medium">{(financials[0].debt_to_assets)}%</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">流动比率</p>
                                <p className="font-medium">{financials[0].current_ratio || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">营收增长率</p>
                                <p className={`font-medium ${getChangeColor(financials[0].tr_yoy || 0)}`}>
                                    {(financials[0].tr_yoy)}%
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">净利增长率</p>
                                <p className={`font-medium ${getChangeColor(financials[0].netprofit_yoy || 0)}`}>
                                    {(financials[0].netprofit_yoy)}%
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
