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
        Schema::create('stock_daily_data', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_id')->constrained()->onDelete('cascade');
            $table->date('date')->comment('交易日');
            $table->decimal('open', 10, 4)->comment('开盘价');
            $table->decimal('high', 10, 4)->comment('最高价');
            $table->decimal('low', 10, 4)->comment('最低价');
            $table->decimal('close', 10, 4)->comment('收盘价');
            $table->unsignedBigInteger('volume')->comment('成交量');
            $table->decimal('amount', 15, 2)->comment('成交额');
            $table->decimal('change', 10, 4)->nullable()->comment('涨跌额');
            $table->decimal('change_percent', 8, 4)->nullable()->comment('涨跌幅');
            $table->timestamps();

            // 唯一索引，防止重复数据
            $table->unique(['stock_id', 'date']);
            
            // 其他索引
            $table->index('date');
            $table->index('stock_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_daily_data');
    }
};
