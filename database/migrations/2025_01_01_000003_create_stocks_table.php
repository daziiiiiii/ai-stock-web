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
        Schema::create('stocks', function (Blueprint $table) {
            $table->id();
            $table->string('symbol', 20)->unique()->comment('股票代码');
            $table->string('ts_code', 20)->unique()->comment('Tushare股票代码');
            $table->string('name', 100)->comment('股票名称');
            $table->enum('market', ['SH', 'SZ', 'HK', 'US'])->comment('市场类型');
            $table->string('industry', 50)->nullable()->comment('行业分类');
            $table->date('list_date')->nullable()->comment('上市日期');
            $table->enum('status', ['active', 'delisted', 'suspended'])->default('active')->comment('状态');
            $table->timestamps();

            // 索引
            $table->index('market');
            $table->index('industry');
            $table->index('status');
            $table->index('ts_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stocks');
    }
};
