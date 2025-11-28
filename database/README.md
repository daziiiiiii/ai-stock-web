# 数据库设计文档

## 🗄️ 数据库架构概述

本项目采用 MySQL 作为主要数据库，Redis 作为缓存层。数据库设计遵循规范化原则，同时考虑性能优化和扩展性。

## 📊 核心数据表设计

### 1. 股票基础信息表 (stocks)

```sql
CREATE TABLE `stocks` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `symbol` varchar(20) NOT NULL COMMENT '股票代码',
  `name` varchar(100) NOT NULL COMMENT '股票名称',
  `market` enum('SH','SZ','HK','US') NOT NULL COMMENT '市场类型',
  `industry` varchar(50) DEFAULT NULL COMMENT '行业分类',
  `list_date` date DEFAULT NULL COMMENT '上市日期',
  `status` enum('active','delisted','suspended') DEFAULT 'active' COMMENT '状态',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `stocks_symbol_unique` (`symbol`),
  KEY `stocks_market_index` (`market`),
  KEY `stocks_industry_index` (`industry`),
  KEY `stocks_status_index` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2. 股票日线数据表 (stock_daily_data)

```sql
CREATE TABLE `stock_daily_data` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `stock_id` bigint(20) UNSIGNED NOT NULL,
  `date` date NOT NULL COMMENT '交易日',
  `open` decimal(10,4) NOT NULL COMMENT '开盘价',
  `high` decimal(10,4) NOT NULL COMMENT '最高价',
  `low` decimal(10,4) NOT NULL COMMENT '最低价',
  `close` decimal(10,4) NOT NULL COMMENT '收盘价',
  `volume` bigint(20) UNSIGNED NOT NULL COMMENT '成交量',
  `amount` decimal(15,2) NOT NULL COMMENT '成交额',
  `change` decimal(10,4) DEFAULT NULL COMMENT '涨跌额',
  `change_percent` decimal(8,4) DEFAULT NULL COMMENT '涨跌幅',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `stock_daily_data_stock_id_date_unique` (`stock_id`,`date`),
  KEY `stock_daily_data_date_index` (`date`),
  KEY `stock_daily_data_stock_id_index` (`stock_id`),
  CONSTRAINT `stock_daily_data_stock_id_foreign` FOREIGN KEY (`stock_id`) REFERENCES `stocks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3. 财务数据表 (financial_data)

```sql
CREATE TABLE `financial_data` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `stock_id` bigint(20) UNSIGNED NOT NULL,
  `report_date` date NOT NULL COMMENT '报告期',
  `report_period` enum('quarter','annual') NOT NULL COMMENT '报告类型',
  `revenue` decimal(15,2) DEFAULT NULL COMMENT '营业收入',
  `net_income` decimal(15,2) DEFAULT NULL COMMENT '净利润',
  `gross_profit` decimal(15,2) DEFAULT NULL COMMENT '毛利润',
  `gross_margin` decimal(8,4) DEFAULT NULL COMMENT '毛利率',
  `net_margin` decimal(8,4) DEFAULT NULL COMMENT '净利率',
  `roe` decimal(8,4) DEFAULT NULL COMMENT '净资产收益率',
  `roa` decimal(8,4) DEFAULT NULL COMMENT '总资产收益率',
  `debt_ratio` decimal(8,4) DEFAULT NULL COMMENT '资产负债率',
  `current_ratio` decimal(8,4) DEFAULT NULL COMMENT '流动比率',
  `quick_ratio` decimal(8,4) DEFAULT NULL COMMENT '速动比率',
  `eps` decimal(8,4) DEFAULT NULL COMMENT '每股收益',
  `pe_ratio` decimal(8,4) DEFAULT NULL COMMENT '市盈率',
  `pb_ratio` decimal(8,4) DEFAULT NULL COMMENT '市净率',
  `ps_ratio` decimal(8,4) DEFAULT NULL COMMENT '市销率',
  `dividend_yield` decimal(8,4) DEFAULT NULL COMMENT '股息率',
  `peg_ratio` decimal(8,4) DEFAULT NULL COMMENT 'PEG比率',
  `operating_cash_flow` decimal(15,2) DEFAULT NULL COMMENT '经营现金流',
  `investing_cash_flow` decimal(15,2) DEFAULT NULL COMMENT '投资现金流',
  `financing_cash_flow` decimal(15,2) DEFAULT NULL COMMENT '筹资现金流',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `financial_data_stock_id_report_date_period_unique` (`stock_id`,`report_date`,`report_period`),
  KEY `financial_data_report_date_index` (`report_date`),
  KEY `financial_data_stock_id_index` (`stock_id`),
  CONSTRAINT `financial_data_stock_id_foreign` FOREIGN KEY (`stock_id`) REFERENCES `stocks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4. 订阅系统表 (subscriptions)

```sql
CREATE TABLE `subscriptions` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `plan` enum('free','basic','pro','enterprise') NOT NULL DEFAULT 'free',
  `status` enum('active','canceled','expired') NOT NULL DEFAULT 'active',
  `starts_at` timestamp NULL DEFAULT NULL,
  `ends_at` timestamp NULL DEFAULT NULL,
  `trial_ends_at` timestamp NULL DEFAULT NULL,
  `canceled_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `subscriptions_user_id_unique` (`user_id`),
  KEY `subscriptions_status_index` (`status`),
  KEY `subscriptions_plan_index` (`plan`),
  CONSTRAINT `subscriptions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 5. 使用记录表 (usage_records)

```sql
CREATE TABLE `usage_records` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) NOT NULL,
  `stock_symbol` varchar(20) NOT NULL,
  `endpoint` varchar(100) NOT NULL,
  `query_count` int(11) NOT NULL DEFAULT 1,
  `date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `usage_records_user_id_index` (`user_id`),
  KEY `usage_records_ip_address_date_index` (`ip_address`,`date`),
  KEY `usage_records_date_index` (`date`),
  CONSTRAINT `usage_records_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## 🔄 数据关系图

```
users
  │
  ├── subscriptions (1:1)
  ├── usage_records (1:N)
  ├── watchlists (1:N)
  └── portfolios (1:N)

stocks
  │
  ├── stock_daily_data (1:N)
  ├── financial_data (1:N)
  ├── technical_indicators (1:N)
  ├── watchlists (N:M through watchlist_stock)
  └── portfolio_holdings (N:M through portfolio_stock)
```

## 🚀 性能优化策略

### 索引设计
- **主键索引**: 所有表都有自增主键
- **唯一索引**: 防止重复数据
- **复合索引**: 优化多条件查询
- **外键索引**: 确保引用完整性

### 分区策略
对于大数据量表（如 stock_daily_data），考虑按时间分区：
```sql
-- 按年份分区
PARTITION BY RANGE (YEAR(date)) (
    PARTITION p2023 VALUES LESS THAN (2024),
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026)
)
```

### 缓存策略
- **Redis缓存**: 热点数据缓存
- **查询结果缓存**: 复杂查询结果缓存
- **API响应缓存**: 减少数据库压力

## 📈 扩展性考虑

### 水平扩展
- **分库分表**: 按市场或时间范围分表
- **读写分离**: 主从复制架构
- **数据归档**: 历史数据归档策略

### 数据更新策略
- **增量更新**: 只更新变化的数据
- **批量处理**: 使用队列处理大数据量
- **数据验证**: 确保数据质量

## 🛠️ 迁移文件创建

下一步将基于此设计创建 Laravel 迁移文件，确保数据库结构的一致性和版本控制。
