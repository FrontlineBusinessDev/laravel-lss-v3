<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('app_trainees_payments', function (Blueprint $table) {
            $table->string('receipt_link')->nullable()->after('official_receipt_number');
        });

        // Backfill: the legacy payments import used to stuff the receipt link into
        // `notes` as "Legacy receipt link: <url>" (fixed once this migration ships —
        // see PaymentImportController) — move any already-imported rows' links into
        // the new column and drop that boilerplate prefix from notes.
        DB::table('app_trainees_payments')
            ->where('notes', 'like', 'Legacy receipt link: %')
            ->orderBy('id')
            ->get()
            ->each(function ($payment) {
                DB::table('app_trainees_payments')->where('id', $payment->id)->update([
                    'receipt_link' => trim(Str::after($payment->notes, 'Legacy receipt link: ')),
                    'notes' => null,
                ]);
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('app_trainees_payments', function (Blueprint $table) {
            $table->dropColumn('receipt_link');
        });
    }
};
