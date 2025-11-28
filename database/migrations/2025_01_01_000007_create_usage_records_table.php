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
        Schema::create('usage_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('ip_address', 45)->comment('IP地址');
            $table->string('stock_symbol', 20)->comment('股票代码');
            $table->string('endpoint', 100)->comment('API端点');
            $table->integer('query_count')->default(1)->comment('查询次数');
            $table->date('date')->comment('使用日期');
            $table->timestamps();

            // 索引
            $table->index('user_id');
            $table->index(['ip_address', 'date']);
            $table->index('date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('usage_records');
    }
};
