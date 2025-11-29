import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, ResponsiveContainer, ComposedChart, Bar } from 'recharts';
import { addTechnicalIndicators } from './utils';

interface TechnicalIndicatorsProps {
    historical: any[];
}

export default function TechnicalIndicators({ historical }: TechnicalIndicatorsProps) {
    if (!historical || historical.length === 0) {
        return (
            <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                    暂无历史数据用于技术指标计算
                </CardContent>
            </Card>
        );
    }

    const technicalData = addTechnicalIndicators([...historical].reverse());

    return (
        <div className="space-y-6">
            {/* 技术指标概览 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">RSI</p>
                            <p className={`text-xl font-bold ${
                                technicalData[0]?.rsi > 70 ? 'text-red-500' : 
                                technicalData[0]?.rsi < 30 ? 'text-green-500' : 'text-blue-500'
                            }`}>
                                {technicalData[0]?.rsi?.toFixed(2) || '-'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {technicalData[0]?.rsi > 70 ? '超买' : 
                                 technicalData[0]?.rsi < 30 ? '超卖' : '正常'}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">MACD</p>
                            <p className={`text-xl font-bold ${
                                (technicalData[0]?.macd || 0) > 0 ? 'text-green-500' : 'text-red-500'
                            }`}>
                                {technicalData[0]?.macd?.toFixed(4) || '-'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {(technicalData[0]?.macd || 0) > 0 ? '看涨' : '看跌'}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">价格位置</p>
                            <p className={`text-xl font-bold ${
                                (technicalData[0]?.close || 0) > (technicalData[0]?.bb_upper || 0) ? 'text-red-500' :
                                (technicalData[0]?.close || 0) < (technicalData[0]?.bb_lower || 0) ? 'text-green-500' : 'text-blue-500'
                            }`}>
                                {((technicalData[0]?.close || 0) > (technicalData[0]?.bb_upper || 0) ? '上轨' :
                                  (technicalData[0]?.close || 0) < (technicalData[0]?.bb_lower || 0) ? '下轨' : '中轨')}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {((technicalData[0]?.close || 0) > (technicalData[0]?.bb_upper || 0) ? '超买区域' :
                                  (technicalData[0]?.close || 0) < (technicalData[0]?.bb_lower || 0) ? '超卖区域' : '正常区域')}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">趋势强度</p>
                            <p className={`text-xl font-bold ${
                                (technicalData[0]?.ma5 || 0) > (technicalData[0]?.ma10 || 0) && 
                                (technicalData[0]?.ma10 || 0) > (technicalData[0]?.ma20 || 0) ? 'text-green-500' :
                                (technicalData[0]?.ma5 || 0) < (technicalData[0]?.ma10 || 0) && 
                                (technicalData[0]?.ma10 || 0) < (technicalData[0]?.ma20 || 0) ? 'text-red-500' : 'text-yellow-500'
                            }`}>
                                {((technicalData[0]?.ma5 || 0) > (technicalData[0]?.ma10 || 0) && 
                                  (technicalData[0]?.ma10 || 0) > (technicalData[0]?.ma20 || 0) ? '强势' :
                                  (technicalData[0]?.ma5 || 0) < (technicalData[0]?.ma10 || 0) && 
                                  (technicalData[0]?.ma10 || 0) < (technicalData[0]?.ma20 || 0) ? '弱势' : '震荡')}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {((technicalData[0]?.ma5 || 0) > (technicalData[0]?.ma10 || 0) && 
                                  (technicalData[0]?.ma10 || 0) > (technicalData[0]?.ma20 || 0) ? '上升趋势' :
                                  (technicalData[0]?.ma5 || 0) < (technicalData[0]?.ma10 || 0) && 
                                  (technicalData[0]?.ma10 || 0) < (technicalData[0]?.ma20 || 0) ? '下降趋势' : '横盘整理')}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 移动平均线分析 */}
            <Card>
                <CardHeader>
                    <CardTitle>移动平均线 (MA)</CardTitle>
                    <CardDescription>
                        5日、10日、20日移动平均线分析
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={technicalData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" tickFormatter={(val) => val.substring(5)} minTickGap={30} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="close" name="收盘价" stroke="#3b82f6" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="ma5" name="MA5" stroke="#ef4444" strokeWidth={1.5} dot={false} />
                                <Line type="monotone" dataKey="ma10" name="MA10" stroke="#22c55e" strokeWidth={1.5} dot={false} />
                                <Line type="monotone" dataKey="ma20" name="MA20" stroke="#f97316" strokeWidth={1.5} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="text-center p-4 border rounded-lg">
                            <p className="text-sm text-muted-foreground">MA5</p>
                            <p className="text-lg font-bold">{technicalData[0]?.ma5?.toFixed(2) || '-'}</p>
                            <p className={`text-sm ${
                                (technicalData[0]?.ma5 || 0) > (technicalData[0]?.ma10 || 0) ? 'text-green-500' : 'text-red-500'
                            }`}>
                                {(technicalData[0]?.ma5 || 0) > (technicalData[0]?.ma10 || 0) ? '↑ 在MA10之上' : '↓ 在MA10之下'}
                            </p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                            <p className="text-sm text-muted-foreground">MA10</p>
                            <p className="text-lg font-bold">{technicalData[0]?.ma10?.toFixed(2) || '-'}</p>
                            <p className={`text-sm ${
                                (technicalData[0]?.ma10 || 0) > (technicalData[0]?.ma20 || 0) ? 'text-green-500' : 'text-red-500'
                            }`}>
                                {(technicalData[0]?.ma10 || 0) > (technicalData[0]?.ma20 || 0) ? '↑ 在MA20之上' : '↓ 在MA20之下'}
                            </p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                            <p className="text-sm text-muted-foreground">MA20</p>
                            <p className="text-lg font-bold">{technicalData[0]?.ma20?.toFixed(2) || '-'}</p>
                            <p className="text-sm text-muted-foreground">长期趋势线</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* RSI分析 */}
            <Card>
                <CardHeader>
                    <CardTitle>相对强弱指数 (RSI)</CardTitle>
                    <CardDescription>
                        14日RSI指标，用于判断超买超卖状态
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={technicalData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" tickFormatter={(val) => val.substring(5)} minTickGap={30} />
                                <YAxis domain={[0, 100]} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="rsi" name="RSI" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey={() => 70} name="超买线" stroke="#ef4444" strokeDasharray="5 5" strokeWidth={1} dot={false} />
                                <Line type="monotone" dataKey={() => 30} name="超卖线" stroke="#22c55e" strokeDasharray="5 5" strokeWidth={1} dot={false} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="text-center p-4 border rounded-lg bg-red-50">
                            <p className="text-sm text-muted-foreground">超买区域</p>
                            <p className="text-lg font-bold text-red-500">70-100</p>
                            <p className="text-xs text-muted-foreground">考虑卖出</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg bg-green-50">
                            <p className="text-sm text-muted-foreground">超卖区域</p>
                            <p className="text-lg font-bold text-green-500">0-30</p>
                            <p className="text-xs text-muted-foreground">考虑买入</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg bg-blue-50">
                            <p className="text-sm text-muted-foreground">当前RSI</p>
                            <p className={`text-lg font-bold ${
                                technicalData[0]?.rsi > 70 ? 'text-red-500' : 
                                technicalData[0]?.rsi < 30 ? 'text-green-500' : 'text-blue-500'
                            }`}>
                                {technicalData[0]?.rsi?.toFixed(2) || '-'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {technicalData[0]?.rsi > 70 ? '超买状态' : 
                                 technicalData[0]?.rsi < 30 ? '超卖状态' : '正常状态'}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 布林带分析 */}
            <Card>
                <CardHeader>
                    <CardTitle>布林带 (Bollinger Bands)</CardTitle>
                    <CardDescription>
                        20日布林带，用于判断价格波动范围和趋势
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={technicalData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" tickFormatter={(val) => val.substring(5)} minTickGap={30} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="close" name="收盘价" stroke="#3b82f6" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="bb_upper" name="上轨" stroke="#ef4444" strokeWidth={1} dot={false} />
                                <Line type="monotone" dataKey="bb_middle" name="中轨" stroke="#22c55e" strokeWidth={1} dot={false} />
                                <Line type="monotone" dataKey="bb_lower" name="下轨" stroke="#ef4444" strokeWidth={1} dot={false} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="text-center p-4 border rounded-lg">
                            <p className="text-sm text-muted-foreground">上轨</p>
                            <p className="text-lg font-bold">{technicalData[0]?.bb_upper?.toFixed(2) || '-'}</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                            <p className="text-sm text-muted-foreground">中轨</p>
                            <p className="text-lg font-bold">{technicalData[0]?.bb_middle?.toFixed(2) || '-'}</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                            <p className="text-sm text-muted-foreground">下轨</p>
                            <p className="text-lg font-bold">{technicalData[0]?.bb_lower?.toFixed(2) || '-'}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* MACD分析 */}
            <Card>
                <CardHeader>
                    <CardTitle>MACD指标</CardTitle>
                    <CardDescription>
                        移动平均收敛散度指标，用于判断趋势转换
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={technicalData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" tickFormatter={(val) => val.substring(5)} minTickGap={30} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="macd" name="MACD" stroke="#3b82f6" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="macd_signal" name="信号线" stroke="#ef4444" strokeWidth={1.5} dot={false} />
                                <Bar dataKey="macd_histogram" name="柱状图" fill="#22c55e" fillOpacity={0.6} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="text-center p-4 border rounded-lg">
                            <p className="text-sm text-muted-foreground">MACD</p>
                            <p className={`text-lg font-bold ${
                                (technicalData[0]?.macd || 0) > 0 ? 'text-green-500' : 'text-red-500'
                            }`}>
                                {technicalData[0]?.macd?.toFixed(4) || '-'}
                            </p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                            <p className="text-sm text-muted-foreground">信号线</p>
                            <p className="text-lg font-bold">{technicalData[0]?.macd_signal?.toFixed(4) || '-'}</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                            <p className="text-sm text-muted-foreground">柱状图</p>
                            <p className={`text-lg font-bold ${
                                (technicalData[0]?.macd_histogram || 0) > 0 ? 'text-green-500' : 'text-red-500'
                            }`}>
                                {technicalData[0]?.macd_histogram?.toFixed(4) || '-'}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
