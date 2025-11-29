// Shared utility functions for stock components

export const formatPrice = (price: number): number => {
    return price;
};

export const formatChange = (change: number): string => {
    if(!change && change !== 0) return '';
    return change > 0 ? `+${change}` : change.toString();
};

export const formatChangePercent = (percent: number): string => {
    return percent > 0 ? `+${percent}%` : `${percent}%`;
};

export const formatNumber = (num: number): string => {
    if(!num && num !== 0) return '';
    if (num >= 100000000) {
        return (num / 100000000) + '亿';
    } else if (num >= 10000) {
        return (num / 10000) + '万';
    }
    return num.toString();
};

export const getChangeColor = (change: number): string => {
    if (change > 0) return 'text-red-500';
    if (change < 0) return 'text-green-500';
    return 'text-gray-500';
};

export const getChangeIcon = (change: number) => {
    if (change > 0) return 'trending-up';
    if (change < 0) return 'trending-down';
    return 'minus';
};

export const getMarketBadge = (market: string) => {
    const marketConfig = {
        SH: { label: '沪市', variant: 'destructive' as const },
        SZ: { label: '深市', variant: 'default' as const },
        HK: { label: '港股', variant: 'outline' as const },
        US: { label: '美股', variant: 'secondary' as const },
    };

    const config = marketConfig[market as keyof typeof marketConfig] || { label: market, variant: 'default' as const };
    return config;
};

// Technical indicator calculation functions
export const calculateMA = (data: any[], period: number): number => {
    if (!data || data.length < period) return 0;
    const sum = data.slice(0, period).reduce((acc, item) => acc + (item.close || 0), 0);
    return sum / period;
};

export const calculateRSI = (data: any[]): number => {
    if (!data || data.length < 15) return 50;
    
    let gains = 0;
    let losses = 0;
    
    for (let i = 1; i < 15; i++) {
        const change = (data[i].close || 0) - (data[i-1].close || 0);
        if (change > 0) {
            gains += change;
        } else {
            losses += Math.abs(change);
        }
    }
    
    const avgGain = gains / 14;
    const avgLoss = losses / 14;
    
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
};

export const calculateBollingerBands = (data: any[]) => {
    if (!data || data.length < 20) {
        return { middle: 0, upper: 0, lower: 0 };
    }
    
    const closes = data.slice(0, 20).map(item => item.close || 0);
    const middle = closes.reduce((sum, close) => sum + close, 0) / 20;
    
    const variance = closes.reduce((sum, close) => {
        return sum + Math.pow(close - middle, 2);
    }, 0) / 20;
    
    const stdDev = Math.sqrt(variance);
    
    return {
        middle,
        upper: middle + (2 * stdDev),
        lower: middle - (2 * stdDev)
    };
};

export const addTechnicalIndicators = (data: any[]) => {
    return data.map((item, index, array) => {
        // 移动平均线
        const ma5 = calculateMA(array.slice(Math.max(0, index - 4), index + 1), 5);
        const ma10 = calculateMA(array.slice(Math.max(0, index - 9), index + 1), 10);
        const ma20 = calculateMA(array.slice(Math.max(0, index - 19), index + 1), 20);
        
        // RSI (简化计算)
        const rsiData = array.slice(Math.max(0, index - 14), index + 1);
        const rsi = calculateRSI(rsiData);
        
        // 布林带
        const bbData = array.slice(Math.max(0, index - 19), index + 1);
        const bb = calculateBollingerBands(bbData);
        
        // MACD (简化计算)
        const ema12 = calculateMA(array.slice(Math.max(0, index - 11), index + 1), 12);
        const ema26 = calculateMA(array.slice(Math.max(0, index - 25), index + 1), 26);
        const macd = ema12 - ema26;
        const macdSignal = calculateMA(array.slice(Math.max(0, index - 8), index + 1).map(d => d.macd || macd), 9);
        const macdHistogram = macd - macdSignal;
        
        return {
            ...item,
            ma5,
            ma10,
            ma20,
            rsi,
            bb_middle: bb.middle,
            bb_upper: bb.upper,
            bb_lower: bb.lower,
            macd,
            macd_signal: macdSignal,
            macd_histogram: macdHistogram
        };
    });
};
