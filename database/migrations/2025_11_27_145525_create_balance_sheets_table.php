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
        Schema::create('balance_sheets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_id')->constrained()->onDelete('cascade');
            $table->date('report_date');
            $table->enum('report_period', ['quarter', 'annual'])->default('quarter');
            $table->decimal('total_assets', 15, 2)->nullable()->comment('总资产');
            $table->decimal('total_liabilities', 15, 2)->nullable()->comment('总负债');
            $table->decimal('equity', 15, 2)->nullable()->comment('股东权益');
            $table->decimal('current_assets', 15, 2)->nullable()->comment('流动资产');
            $table->decimal('non_current_assets', 15, 2)->nullable()->comment('非流动资产');
            $table->decimal('current_liabilities', 15, 2)->nullable()->comment('流动负债');
            $table->decimal('non_current_liabilities', 15, 2)->nullable()->comment('非流动负债');
            $table->decimal('debt_ratio', 8, 4)->nullable()->comment('负债率');
            $table->decimal('current_ratio', 8, 4)->nullable()->comment('流动比率');
            $table->decimal('quick_ratio', 8, 4)->nullable()->comment('速动比率');
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
        Schema::dropIfExists('balance_sheets');
    }
};
