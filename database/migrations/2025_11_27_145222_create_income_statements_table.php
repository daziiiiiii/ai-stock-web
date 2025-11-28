<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('income_statements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_id')->constrained()->onDelete('cascade');
            $table->date('report_date');
            $table->enum('report_period', ['quarter', 'annual'])->default('quarter');
            $table->decimal('revenue', 15, 2)->nullable()->comment('营业收入');
            $table->decimal('net_income', 15, 2)->nullable()->comment('净利润');
            $table->decimal('gross_profit', 15, 2)->nullable()->comment('毛利润');
            $table->decimal('oper_cost', 15, 2)->nullable()->comment('营业成本');
            $table->decimal('sell_exp', 15, 2)->nullable()->comment('销售费用');
            $table->decimal('admin_exp', 15, 2)->nullable()->comment('管理费用');
            $table->decimal('fin_exp', 15, 2)->nullable()->comment('财务费用');
            $table->decimal('total_profit', 15, 2)->nullable()->comment('利润总额');
            $table->decimal('gross_margin', 8, 4)->nullable()->comment('毛利率');
            $table->decimal('net_margin', 8, 4)->nullable()->comment('净利率');
            $table->decimal('eps', 8, 4)->nullable()->comment('每股收益');
            $table->json('data')->nullable()->comment('原始数据');
            $table->timestamps();

            // 索引
            $table->index(['stock_id', 'report_date']);
            $table->index('report_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('income_statements');
    }
};
