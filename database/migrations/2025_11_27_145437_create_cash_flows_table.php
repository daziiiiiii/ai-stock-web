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
        Schema::create('cash_flows', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_id')->constrained()->onDelete('cascade');
            $table->date('report_date');
            $table->enum('report_period', ['quarter', 'annual'])->default('quarter');
            $table->decimal('operating_cash_flow', 15, 2)->nullable()->comment('经营活动现金流');
            $table->decimal('investing_cash_flow', 15, 2)->nullable()->comment('投资活动现金流');
            $table->decimal('financing_cash_flow', 15, 2)->nullable()->comment('筹资活动现金流');
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
        Schema::dropIfExists('cash_flows');
    }
};
