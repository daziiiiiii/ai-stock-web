# 财务数据字段说明文档

基于Tushare API接口文件同步的完整财务数据字段说明。

## 数据接口概览

系统支持以下四种财务数据接口：

1. **利润表 (Income)** - 公司盈利能力数据
2. **资产负债表 (Balance Sheet)** - 公司资产负债状况
3. **现金流量表 (Cash Flow)** - 公司现金流情况  
4. **财务指标 (Financial Indicators)** - 综合财务比率和指标

## 利润表字段 (Income)

### 核心收入指标
- `revenue` - 营业收入
- `total_revenue` - 营业总收入
- `int_income` - 利息收入
- `prem_earned` - 已赚保费
- `comm_income` - 手续费及佣金收入

### 成本费用指标
- `oper_cost` - 营业成本
- `total_cogs` - 营业总成本
- `sell_exp` - 销售费用
- `admin_exp` - 管理费用
- `fin_exp` - 财务费用
- `biz_tax_surchg` - 营业税金及附加

### 利润指标
- `gross_profit` - 毛利润
- `operate_profit` - 营业利润
- `total_profit` - 利润总额
- `net_income` - 净利润
- `n_income_attr_p` - 净利润(不含少数股东损益)

### 每股收益
- `basic_eps` - 基本每股收益
- `diluted_eps` - 稀释每股收益

## 资产负债表字段 (Balance Sheet)

### 资产类
- `total_assets` - 资产总计
- `total_cur_assets` - 流动资产合计
- `total_nca` - 非流动资产合计
- `money_cap` - 货币资金
- `accounts_receiv` - 应收账款
- `inventories` - 存货
- `fix_assets` - 固定资产

### 负债类
- `total_liab` - 负债合计
- `total_cur_liab` - 流动负债合计
- `total_ncl` - 非流动负债合计
- `st_borr` - 短期借款
- `lt_borr` - 长期借款

### 所有者权益
- `total_hldr_eqy_inc_min_int` - 股东权益合计(含少数股东权益)
- `total_hldr_eqy_exc_min_int` - 股东权益合计(不含少数股东权益)

## 财务指标字段 (Financial Indicators)

### 盈利能力指标
- `roe` - 净资产收益率
- `roa` - 总资产报酬率
- `gross_margin` - 毛利率
- `net_margin` - 净利率
- `eps` - 基本每股收益

### 偿债能力指标
- `debt_ratio` - 资产负债率
- `current_ratio` - 流动比率
- `quick_ratio` - 速动比率
- `cash_ratio` - 现金比率

### 营运能力指标
- `assets_turn` - 总资产周转率
- `ar_turn` - 应收账款周转率
- `ca_turn` - 流动资产周转率
- `fa_turn` - 固定资产周转率

### 成长能力指标
- `revenue_yoy` - 营业收入同比增长率
- `net_income_yoy` - 净利润同比增长率
- `or_yoy` - 营业收入同比增长率
- `netprofit_yoy` - 归属母公司股东的净利润同比增长率

### 估值指标
- `pe_ratio` - 市盈率
- `pb_ratio` - 市净率
- `ps_ratio` - 市销率
- `dividend_yield` - 股息率

## 现金流量表字段 (Cash Flow)

### 经营活动现金流
- `operating_cash_flow` - 经营活动产生的现金流量净额
- `cash_received_from_sales` - 销售商品、提供劳务收到的现金
- `cash_paid_for_operations` - 购买商品、接受劳务支付的现金

### 投资活动现金流
- `investing_cash_flow` - 投资活动产生的现金流量净额
- `cash_received_from_investments` - 收回投资收到的现金
- `cash_paid_for_investments` - 投资支付的现金

### 筹资活动现金流
- `financing_cash_flow` - 筹资活动产生的现金流量净额
- `cash_received_from_financing` - 吸收投资收到的现金
- `cash_paid_for_financing` - 偿还债务支付的现金

## 数据导入映射关系

### 当前系统使用的关键字段

#### 盈利能力分析
```
revenue          → 营业收入
net_income       → 净利润  
gross_profit     → 毛利润
gross_margin     → 毛利率
net_margin       → 净利率
roe              → 净资产收益率
roa              → 总资产报酬率
```

#### 偿债能力分析
```
debt_ratio       → 资产负债率
current_ratio    → 流动比率
quick_ratio      → 速动比率
cash_ratio       → 现金比率
```

#### 营运能力分析
```
assets_turn      → 总资产周转率
ar_turn          → 应收账款周转率
ca_turn          → 流动资产周转率
fa_turn          → 固定资产周转率
```

#### 成长能力分析
```
revenue_yoy      → 营业收入同比增长率
net_income_yoy   → 净利润同比增长率
or_yoy           → 营业收入同比增长率
netprofit_yoy    → 归属母公司股东的净利润同比增长率
```

#### 成本费用分析
```
oper_cost        → 营业成本
sell_exp         → 销售费用
admin_exp        → 管理费用
fin_exp          → 财务费用
```

## 数据质量说明

1. **必填字段**: 所有标注为"Y"的字段在Tushare API中为必填字段
2. **数据类型**: 
   - `str`: 字符串类型
   - `float`: 浮点数类型
   - `int`: 整数类型
3. **数据单位**: 金额单位为元，比率单位为百分比
4. **更新频率**: 数据随财报发布周期更新

## 注意事项

1. 不同行业公司(银行、保险、证券)的财务指标含义可能有所不同
2. 合并报表和母公司报表数据需要区分使用
3. 单季度数据和累计数据需要根据分析目的选择使用
4. 同比增长率数据需要进行时间序列验证

## 接口调用限制

- 单次请求数据长度限制
- 请求频率限制
- 数据更新延迟考虑
- 历史数据覆盖范围

此文档基于Tushare API接口定义文件生成，确保与数据源字段定义完全一致。
