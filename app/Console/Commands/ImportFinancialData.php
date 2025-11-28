<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\Stock;
use App\Models\IncomeStatement;
use App\Models\FinancialIndicator;
use App\Models\CashFlow;
use App\Models\BalanceSheet;
use League\Csv\Reader;
use League\Csv\Statement;

class ImportFinancialData extends Command
{
    protected $signature = 'import:financial-data {file?} {--type=all} {--chunk=1000}';
    protected $description = '批量导入股票财务数据';

    public function handle()
    {
        $type = $this->option('type');
        $chunkSize = (int)$this->option('chunk');
        $file = $this->argument('file');

        $this->info('开始导入股票财务数据...');

        try {
            // 如果指定了文件，必须指定类型
            if ($file && $type === 'all') {
                $this->error('指定文件导入时，必须通过 --type 参数指定数据类型 (balancesheet, fina_indicator, income, cashflow)');
                return;
            }

            // 如果没有指定文件，先尝试导入股票基本信息
            if (!$file) {
                $this->importStockBasicData();
            }

            // 定义类型映射 - 使用前200条数据的文件
            $map = [
                'balancesheet' => 'financial/balancesheet_200.csv',
                'fina_indicator' => 'financial/fina_indicator_200.csv',
                'income' => 'financial/income_200.csv',
                'cashflow' => 'financial/cashflow_200.csv',
            ];

            if ($file) {
                // 单文件导入
                $this->importCsvData($file, $type, $chunkSize);
            } else {
                // 批量导入
                foreach ($map as $key => $relativePath) {
                    if ($type === 'all' || $type === $key) {
                        $path = base_path($relativePath);
                        $this->importCsvData($path, $key, $chunkSize);
                    }
                }
            }

            $this->info('股票财务数据导入完成！');

        } catch (\Exception $e) {
            // 错误信息只保留1000字符
            $errorMessage = substr($e->getMessage(), 0, 1000);
            $this->error('导入过程中发生错误: ' . $errorMessage);
            Log::error('财务数据导入错误: ' . $errorMessage, [
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    /**
     * 导入股票基本信息
     */
    private function importStockBasicData()
    {
        $path = base_path('financial/fina_indicator_200.csv');
        if (!file_exists($path)) {
            $this->warn("股票基本信息源文件不存在: {$path}，跳过基本信息导入");
            return;
        }

        $this->info('开始导入股票基本信息...');

        // 从财务指标文件中提取股票代码和名称
        $csv = Reader::createFromPath($path, 'r');
        $csv->setHeaderOffset(0);

        $stocks = [];
        $processedCodes = [];

        foreach ($csv->getRecords() as $record) {
            $tsCode = $record['ts_code'];
            
            // 跳过已处理的股票代码
            if (in_array($tsCode, $processedCodes)) {
                continue;
            }

            $processedCodes[] = $tsCode;

            // 从股票代码中提取市场信息
            $market = str_contains($tsCode, '.SH') ? 'SH' : 
                     (str_contains($tsCode, '.SZ') ? 'SZ' : 
                     (str_contains($tsCode, '.HK') ? 'HK' : 'US'));

            // 获取股票名称（这里需要从其他数据源获取，暂时使用代码）
            $symbol = str_replace(['.SH', '.SZ', '.HK', '.US'], '', $tsCode);
            $name = $symbol; // 实际应用中应该从其他数据源获取名称

            $stocks[] = [
                'symbol' => $symbol,
                'ts_code' => $tsCode,
                'name' => $name,
                'market' => $market,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // 批量插入股票信息
        $chunks = array_chunk($stocks, 1000);
        foreach ($chunks as $chunk) {
            Stock::insertOrIgnore($chunk);
        }

        $this->info("成功导入 " . count($stocks) . " 只股票的基本信息");
    }

    /**
     * 通用CSV数据导入方法
     */
    private function importCsvData($filePath, $dataType, $chunkSize)
    {
        if (!file_exists($filePath)) {
            $this->warn("文件不存在: {$filePath}，跳过");
            return;
        }

        $this->info("开始导入 {$dataType} 数据...");

        $csv = Reader::createFromPath($filePath, 'r');
        $csv->setHeaderOffset(0);
        $csv->skipInputBOM(); // 关键修复：处理 BOM 头，防止首列读取错误

        $records = Statement::create()
            ->limit(200) // 只导入前200条数据
            ->process($csv);
        
        $totalRecords = count($records);
        
        if ($totalRecords === 0) {
            $this->info("文件 {$filePath} 没有数据");
            return;
        }

        $this->info("发现 {$totalRecords} 条记录");
        $bar = $this->output->createProgressBar($totalRecords);
        $bar->start();

        $processedCount = 0;
        $skippedCount = 0;
        
        foreach ($records as $offset => $record) {
            // 健壮性检查：确保关键字段存在
            if (empty($record['ts_code']) || empty($record['end_date'])) {
                Log::warning("导入 {$dataType} 时跳过无效记录 (行号: {$offset})", $record);
                $skippedCount++;
                $bar->advance();
                continue;
            }

            $symbol = str_replace(['.SH', '.SZ', '.HK', '.US'], '', $record['ts_code']);
            
            // 查找股票ID
            $stock = Stock::where('symbol', $symbol)->first();
            if (!$stock) {
                Log::warning("导入 {$dataType} 时找不到对应的股票: {$symbol} (行号: {$offset})");
                $skippedCount++;
                $bar->advance();
                continue;
            }

            // 根据数据类型映射字段并插入到对应的表
            $success = $this->insertFinancialData($record, $dataType, $stock->id);
            
            if ($success) {
                $processedCount++;
            } else {
                $skippedCount++;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("成功导入 {$dataType} 数据: {$processedCount} 条记录已处理, {$skippedCount} 条记录被跳过");
    }

    /**
     * 插入财务数据到对应的表
     */
    private function insertFinancialData($record, $dataType, $stockId)
    {
        $reportDate = $record['end_date'];
        
        // 处理报告日期格式 (YYYYMMDD -> YYYY-MM-DD)
        if (preg_match('/^\d{8}$/', $reportDate)) {
            $year = substr($reportDate, 0, 4);
            $month = substr($reportDate, 4, 2);
            $day = substr($reportDate, 6, 2);
            $reportDate = "{$year}-{$month}-{$day}";
        }
        
        // 确定报告期类型
        $reportPeriod = $this->determineReportPeriod($reportDate);

        $baseData = [
            'stock_id' => $stockId,
            'report_date' => $reportDate,
            'report_period' => $reportPeriod,
            'created_at' => now(),
            'updated_at' => now(),
        ];

        try {
            switch ($dataType) {
                case 'income':
                    $incomeData = array_merge($baseData, $this->mapIncomeData($record));
                    IncomeStatement::insertOrIgnore($incomeData);
                    break;
                    
                case 'fina_indicator':
                    $indicatorData = array_merge($baseData, $this->mapFinaIndicatorData($record));
                    FinancialIndicator::insertOrIgnore($indicatorData);
                    break;
                    
                case 'cashflow':
                    $cashflowData = array_merge($baseData, $this->mapCashflowData($record));
                    CashFlow::insertOrIgnore($cashflowData);
                    break;
                    
                case 'balancesheet':
                    $balanceSheetData = array_merge($baseData, $this->mapBalanceSheetData($record));
                    BalanceSheet::insertOrIgnore($balanceSheetData);
                    break;
                    
                default:
                    return false;
            }
            
            return true;
        } catch (\Exception $e) {
            $this->info($e->getMessage());
            Log::error("插入 {$dataType} 数据失败: " . $e->getMessage(), [
                'stock_id' => $stockId,
                'report_date' => $reportDate,
                'record' => $record
            ]);
            return false;
        }
    }

    /**
     * 根据数据类型映射财务数据字段
     */
    private function mapFinancialData($record, $dataType, $stockId)
    {
        $reportDate = $record['end_date'];
        // $annDate = !empty($record['ann_date']) ? $record['ann_date'] : null;
        
        // 处理报告日期格式 (YYYYMMDD -> YYYY-MM-DD)
        if (preg_match('/^\d{8}$/', $reportDate)) {
            $year = substr($reportDate, 0, 4);
            $month = substr($reportDate, 4, 2);
            $day = substr($reportDate, 6, 2);
            $reportDate = "{$year}-{$month}-{$day}";
        }
        
        // 确定报告期类型
        $reportPeriod = $this->determineReportPeriod($reportDate);

        $data = [
            'stock_id' => $stockId,
            'report_date' => $reportDate,
            'report_period' => $reportPeriod,
            'data_type' => $dataType, // 添加数据类型字段
            'created_at' => now(),
            'updated_at' => now(),
        ];

        // 根据数据类型映射字段
        switch ($dataType) {
            case 'fina_indicator':
                $data = array_merge($data, $this->mapFinaIndicatorData($record));
                break;
            case 'income':
                $data = array_merge($data, $this->mapIncomeData($record));
                break;
            case 'cashflow':
                $data = array_merge($data, $this->mapCashflowData($record));
                break;
            case 'balancesheet':
                $data = array_merge($data, $this->mapBalanceSheetData($record));
                break;
            default:
                // 对于未知类型，存储为JSON
                $data['data'] = json_encode($record);
                break;
        }

        return $data;
    }

    /**
     * 确定报告期类型
     */
    private function determineReportPeriod($reportDate)
    {
        // 处理YYYYMMDD格式的日期
        if (preg_match('/^\d{8}$/', $reportDate)) {
            $year = substr($reportDate, 0, 4);
            $month = substr($reportDate, 4, 2);
            $day = substr($reportDate, 6, 2);
            $date = \Carbon\Carbon::createFromDate($year, $month, $day);
        } else {
            $date = \Carbon\Carbon::parse($reportDate);
        }
        
        $month = $date->month;
        
        // 如果报告期在3月、6月、9月、12月，可能是季度或年度报告
        if (in_array($month, [3, 6, 9, 12])) {
            // 检查是否是年度报告（12月31日）
            if ($month === 12 && $date->day === 31) {
                return 'annual';
            }
            return 'quarter';
        }
        
        return 'quarter'; // 默认为季度
    }

    /**
     * 映射财务指标数据
     */
    private function mapFinaIndicatorData($record)
    {
        $whiteList = [
            'eps', 'gross_margin', 'netprofit_margin', 'roe', 'roa', 'current_ratio', 'quick_ratio', 'debt_to_assets',
            'dt_eps', 'total_revenue_ps', 'revenue_ps', 'capital_rese_ps', 'surplus_rese_ps', 'undist_profit_ps',
            'extra_item', 'profit_dedt', 'cash_ratio', 'ar_turn', 'ca_turn', 'fa_turn', 'assets_turn', 'op_income',
            'ebit', 'ebitda', 'fcff', 'fcfe', 'current_exint', 'noncurrent_exint', 'interestdebt', 'netdebt',
            'tangible_asset', 'working_capital', 'networking_capital', 'invest_capital', 'retained_earnings',
            'diluted2_eps', 'bps', 'ocfps', 'retainedps', 'cfps', 'ebit_ps', 'fcff_ps', 'fcfe_ps',
            'grossprofit_margin', 'cogs_of_sales', 'expense_of_sales', 'profit_to_gr', 'saleexp_to_gr',
            'adminexp_of_gr', 'finaexp_of_gr', 'impai_ttm', 'gc_of_gr', 'op_of_gr', 'ebit_of_gr', 'roe_waa',
            'roe_dt', 'npta', 'roic', 'roe_yearly', 'roa2_yearly', 'assets_to_eqt', 'dp_assets_to_eqt',
            'ca_to_assets', 'nca_to_assets', 'tbassets_to_totalassets', 'int_to_talcap', 'eqt_to_talcapital',
            'currentdebt_to_debt', 'longdeb_to_debt', 'ocf_to_shortdebt', 'debt_to_eqt', 'eqt_to_debt',
            'eqt_to_interestdebt', 'tangibleasset_to_debt', 'tangasset_to_intdebt', 'tangibleasset_to_netdebt',
            'ocf_to_debt', 'turn_days', 'roa_yearly', 'roa_dp', 'fixed_assets', 'profit_to_op', 'q_saleexp_to_gr',
            'q_gc_to_gr', 'q_roe', 'q_dt_roe', 'q_npta', 'q_ocf_to_sales', 'basic_eps_yoy', 'dt_eps_yoy',
            'cfps_yoy', 'op_yoy', 'ebt_yoy', 'netprofit_yoy', 'dt_netprofit_yoy', 'ocf_yoy', 'roe_yoy',
            'bps_yoy', 'assets_yoy', 'eqt_yoy', 'tr_yoy', 'or_yoy', 'q_sales_yoy', 'q_op_qoq', 'equity_yoy'
        ];

        $data = [];

        foreach ($whiteList as $field) {
            $csvColumn = $fieldMap[$field] ?? $field;

            if (array_key_exists($csvColumn, $record)) {
                $data[$field] = $this->parseDecimal($record[$csvColumn], 4);
        }
        }

        // 保留原始数据
        $data['data'] = json_encode($record);

        return $data;
    }

    /**
     * 映射利润表数据
     */
    private function mapIncomeData($record)
    {
        return [
            'revenue' => $this->parseDecimal($record['total_revenue'] ?? null, 2),
            'net_income' => $this->parseDecimal($record['n_income'] ?? null, 2),
            'gross_profit' => $this->parseDecimal($record['gross_profit'] ?? null, 2),
            'gross_margin' => $this->parseDecimal($record['gross_margin'] ?? null, 4),
            'net_margin' => $this->parseDecimal($record['net_margin'] ?? null, 4),
            'eps' => $this->parseDecimal($record['eps'] ?? null, 4),
            'data' => json_encode($record), // 保留原始数据用于参考
        ];
    }

    /**
     * 映射现金流量表数据
     */
    private function mapCashflowData($record)
    {
        return [
            'operating_cash_flow' => $this->parseDecimal($record['net_operating_cash_flow'] ?? null, 2),
            'investing_cash_flow' => $this->parseDecimal($record['net_investing_cash_flow'] ?? null, 2),
            'financing_cash_flow' => $this->parseDecimal($record['net_financing_cash_flow'] ?? null, 2),
            'data' => json_encode($record), // 保留原始数据用于参考
        ];
    }

    /**
     * 映射资产负债表数据
     */
    private function mapBalanceSheetData($record)
    {
        // 资产负债表数据较多，只映射关键指标
        return [
            'debt_ratio' => $this->parseDecimal($record['debt_to_assets'] ?? null, 4),
            'current_ratio' => $this->parseDecimal($record['current_ratio'] ?? null, 4),
            'quick_ratio' => $this->parseDecimal($record['quick_ratio'] ?? null, 4),
            'data' => json_encode($record), // 保留原始数据用于参考
        ];
    }

    /**
     * 解析十进制数值
     */
    private function parseDecimal($value, $decimals)
    {
        if (empty($value) || $value === '' || $value === null) {
            return null;
        }

        // 处理科学计数法
        if (is_numeric($value)) {
            return round((float)$value, $decimals);
        }

        // 处理字符串数值
        $cleaned = preg_replace('/[^\d.-]/', '', $value);
        if ($cleaned === '' || $cleaned === null) {
            return null;
        }

        return round((float)$cleaned, $decimals);
    }
}
