import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, Bar, ResponsiveContainer, BarChart } from 'recharts';
import { formatPrice, formatChange, formatChangePercent, formatNumber, getChangeColor } from './utils';

interface HistoricalDataProps {
    historical: any[];
}

export default function HistoricalData({ historical }: HistoricalDataProps) {
    if (!historical || historical.length === 0) {
        return (
            <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                    暂无历史数据
                </CardContent>
            </Card>
        );
    }

    const chartHistorical = [...historical].reverse();

    return (
        <div className="space-y-6">
            {/* 价格和成交量概览 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">平均收盘价</p>
                            <p className="text-xl font-bold text-blue-600">
                                {((historical.reduce((sum, day) => sum + (day.close || 0), 0) / historical.length)).toFixed(2)}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">平均成交量</p>
                            <p className="text-xl font-bold text-green-600">
                                {formatNumber((historical.reduce((sum, day) => sum + (day.volume || 0), 0) / historical.length))}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">上涨天数</p>
                            <p className="text-xl font-bold text-red-600">
                                {historical.filter(day => day.change > 0).length} / {historical.length}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 股价K线图 */}
            <Card>
                <CardHeader>
                    <CardTitle>K线图</CardTitle>
                    <CardDescription>
                        包含开盘价、最高价、最低价、收盘价的完整价格走势
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartHistorical}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" tickFormatter={(val) => val.substring(5)} minTickGap={30} />
                                <YAxis yAxisId="left" domain={['auto', 'auto']} />
                                <YAxis yAxisId="right" orientation="right" domain={['auto', 'auto']} />
                                <Tooltip 
                                    formatter={(value: any, name: string) => {
                                        if (name === '成交量') {
                                            return [formatNumber(value), name];
                                        }
                                        return [value, name];
                                    }}
                                />
                                <Legend />
                                <Line yAxisId="left" type="monotone" dataKey="close" name="收盘价" stroke="#3b82f6" strokeWidth={2} dot={false} />
                                <Line yAxisId="left" type="monotone" dataKey="open" name="开盘价" stroke="#22c55e" strokeWidth={1} dot={false} />
                                <Line yAxisId="left" type="monotone" dataKey="high" name="最高价" stroke="#ef4444" strokeWidth={1} dot={false} />
                                <Line yAxisId="left" type="monotone" dataKey="low" name="最低价" stroke="#f97316" strokeWidth={1} dot={false} />
                                <Bar yAxisId="right" dataKey="volume" name="成交量" fill="#94a3b8" fillOpacity={0.6} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* 涨跌幅分布 */}
            <Card>
                <CardHeader>
                    <CardTitle>涨跌幅分布</CardTitle>
                    <CardDescription>
                        价格波动统计和分布情况
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 border rounded-lg">
                            <p className="text-sm text-muted-foreground">最大涨幅</p>
                            <p className="text-lg font-bold text-red-500">
                                {Math.max(...historical.map(day => day.change_percent || 0)).toFixed(2)}%
                            </p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                            <p className="text-sm text-muted-foreground">最大跌幅</p>
                            <p className="text-lg font-bold text-green-500">
                                {Math.min(...historical.map(day => day.change_percent || 0)).toFixed(2)}%
                            </p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                            <p className="text-sm text-muted-foreground">平均涨幅</p>
                            <p className={`text-lg font-bold ${
                                (historical.reduce((sum, day) => sum + (day.change_percent || 0), 0) / historical.length) > 0 ? 'text-red-500' : 'text-green-500'
                            }`}>
                                {((historical.reduce((sum, day) => sum + (day.change_percent || 0), 0) / historical.length)).toFixed(2)}%
                            </p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                            <p className="text-sm text-muted-foreground">波动率</p>
                            <p className="text-lg font-bold text-purple-500">
                                {Math.sqrt(
                                    historical.reduce((sum, day) => {
                                        const avg = historical.reduce((s, d) => s + (d.change_percent || 0), 0) / historical.length;
                                        return sum + Math.pow((day.change_percent || 0) - avg, 2);
                                    }, 0) / historical.length
                                ).toFixed(2)}%
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 成交量分析 */}
            <Card>
                <CardHeader>
                    <CardTitle>成交量分析</CardTitle>
                    <CardDescription>
                        成交量变化趋势和异常分析
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartHistorical}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" tickFormatter={(val) => val.substring(5)} minTickGap={30} />
                                <YAxis tickFormatter={(val) => formatNumber(val).toString()} />
                                <Tooltip 
                                    formatter={(value: any) => [formatNumber(value), '成交量']}
                                    labelFormatter={(label) => `日期: ${label}`}
                                />
                                <Bar dataKey="volume" name="成交量" fill="#3b82f6" fillOpacity={0.8} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* 详细历史数据表格 */}
            <Card>
                <CardHeader>
                    <CardTitle>详细历史数据</CardTitle>
                    <CardDescription>
                        最近 {historical.length} 个交易日的完整数据
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
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
                                    <TableHead>成交额</TableHead>
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
                                        <TableCell>{day.amount ? formatNumber(day.amount) : '-'}</TableCell>
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
