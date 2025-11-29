import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, ResponsiveContainer } from 'recharts';
import { getChangeColor } from './utils';

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

interface FinancialDataProps {
    financials: FinancialData[];
}

export default function FinancialData({ financials }: FinancialDataProps) {
    if (!financials || financials.length === 0) {
        return (
            <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                    暂无财务数据
                </CardContent>
            </Card>
        );
    }

    const chartFinancials = [...financials].reverse();

    return (
        <div className="space-y-6">
            {/* 财务指标概览卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">平均ROE</p>
                            <p className="text-2xl font-bold text-green-600">
                                {((financials.reduce((sum, f) => sum + +(f.roe || 0), 0) / financials.length)).toFixed(4)}%
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">平均毛利率</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {((financials.reduce((sum, f) => sum + +(f.grossprofit_margin || 0), 0) / financials.length)).toFixed(4)}%
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">平均净利率</p>
                            <p className="text-2xl font-bold text-purple-600">
                                {((financials.reduce((sum, f) => sum + +(f.netprofit_margin || 0), 0) / financials.length)).toFixed(4)}%
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">平均负债率</p>
                            <p className="text-2xl font-bold text-orange-600">
                                {((financials.reduce((sum, f) => sum + +(f.debt_to_assets || 0), 0) / financials.length)).toFixed(4)}%
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">营收增长率</p>
                            <p className={`text-2xl font-bold ${
                                (financials[0].tr_yoy || 0) > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {((financials[0].tr_yoy || 0))}%
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">净利增长率</p>
                            <p className={`text-2xl font-bold ${
                                (financials[0].netprofit_yoy || 0) > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {((financials[0].netprofit_yoy || 0))}%
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 盈利能力分析 */}
            {financials[0] && (
                <Card>
                    <CardHeader>
                        <CardTitle>盈利能力分析</CardTitle>
                        <CardDescription>
                            核心盈利指标分析
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="text-center p-4 border rounded-lg bg-blue-50">
                                <p className="text-sm text-muted-foreground">净资产收益率</p>
                                <p className="text-xl font-bold text-blue-600 mt-1">
                                    {((financials[0].roe || 0))}%
                                </p>
                            </div>
                            <div className="text-center p-4 border rounded-lg bg-green-50">
                                <p className="text-sm text-muted-foreground">总资产报酬率</p>
                                <p className="text-xl font-bold text-green-600 mt-1">
                                    {((financials[0].roa || 0))}%
                                </p>
                            </div>
                            <div className="text-center p-4 border rounded-lg bg-purple-50">
                                <p className="text-sm text-muted-foreground">净利率</p>
                                <p className="text-xl font-bold text-purple-600 mt-1">
                                    {((financials[0].netprofit_margin || 0))}%
                                </p>
                            </div>
                            <div className="text-center p-4 border rounded-lg bg-orange-50">
                                <p className="text-sm text-muted-foreground">毛利率</p>
                                <p className="text-xl font-bold text-orange-600 mt-1">
                                    {((financials[0].grossprofit_margin || 0))}%
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* 偿债能力分析 */}
            {financials[0] && (
                <Card>
                    <CardHeader>
                        <CardTitle>偿债能力分析</CardTitle>
                        <CardDescription>
                            短期和长期偿债能力指标
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 border rounded-lg">
                                <p className="text-sm text-muted-foreground">资产负债率</p>
                                <p className="text-lg font-bold mt-1">
                                    {((financials[0].debt_to_assets || 0))}%
                                </p>
                            </div>
                            <div className="text-center p-4 border rounded-lg">
                                <p className="text-sm text-muted-foreground">流动比率</p>
                                <p className="text-lg font-bold mt-1">
                                    {financials[0].current_ratio || '-'}
                                </p>
                            </div>
                            <div className="text-center p-4 border rounded-lg">
                                <p className="text-sm text-muted-foreground">速动比率</p>
                                <p className="text-lg font-bold mt-1">
                                    {financials[0].quick_ratio || '-'}
                                </p>
                            </div>
                            <div className="text-center p-4 border rounded-lg">
                                <p className="text-sm text-muted-foreground">现金比率</p>
                                <p className="text-lg font-bold mt-1">
                                    {financials[0].cash_ratio || '-'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* 财务数据趋势分析 - 图表版 */}
            <Card>
                <CardHeader>
                    <CardTitle>关键指标趋势</CardTitle>
                    <CardDescription>
                        核心财务指标变化趋势
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartFinancials}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="report_date" tickFormatter={(val) => val.substring(0, 7)} />
                                <YAxis yAxisId="left" tickFormatter={(val) => (val).toFixed(0) + '%'} />
                                <Tooltip 
                                    formatter={(value: any, name: string) => {
                                        return [(value) + '%', name];
                                    }}
                                    labelFormatter={(label) => `报告期: ${label}`}
                                />
                                <Legend />
                                <Line yAxisId="left" type="monotone" dataKey="roe" name="ROE" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                                <Line yAxisId="left" type="monotone" dataKey="grossprofit_margin" name="毛利率" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
                                <Line yAxisId="left" type="monotone" dataKey="netprofit_margin" name="净利率" stroke="#f97316" strokeWidth={2} dot={{ r: 4 }} />
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
                                    <TableHead>每股收益</TableHead>
                                    <TableHead>稀释每股收益</TableHead>
                                    <TableHead>毛利率</TableHead>
                                    <TableHead>净利率</TableHead>
                                    <TableHead>ROE</TableHead>
                                    <TableHead>资产负债率</TableHead>
                                    <TableHead>流动比率</TableHead>
                                    <TableHead>速动比率</TableHead>
                                    <TableHead>营收增长率</TableHead>
                                    <TableHead>净利增长率</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {financials.map((financial, index) => (
                                    <TableRow key={index} className={
                                        financial.report_period === 'annual' ? 'bg-blue-50 hover:bg-blue-100' : ''
                                    }>
                                        <TableCell className="font-medium whitespace-nowrap">
                                            {financial.report_date} ({financial.report_period})
                                            {index === 0 && (
                                                <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 border-green-200">
                                                    最新
                                                </Badge>
                                            )}
                                            {financial.report_period === 'annual' && (
                                                <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800 border-blue-200">
                                                    年报
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>{financial.eps || '-'}</TableCell>
                                        <TableCell>{financial.dt_eps || '-'}</TableCell>
                                        <TableCell>{((financial.grossprofit_margin || 0))}%</TableCell>
                                        <TableCell>{((financial.netprofit_margin || 0))}%</TableCell>
                                        <TableCell className={
                                            (financial.roe || 0) > 15 ? 'bg-green-100 font-semibold text-green-800' : ''
                                        }>
                                            {((financial.roe || 0))}%
                                        </TableCell>
                                        <TableCell>{((financial.debt_to_assets || 0))}%</TableCell>
                                        <TableCell>{financial.current_ratio || '-'}</TableCell>
                                        <TableCell>{financial.quick_ratio || '-'}</TableCell>
                                        <TableCell className={getChangeColor(financial.tr_yoy || 0)}>
                                            {((financial.tr_yoy || 0))}%
                                        </TableCell>
                                        <TableCell className={getChangeColor(financial.netprofit_yoy || 0)}>
                                            {((financial.netprofit_yoy || 0))}%
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
