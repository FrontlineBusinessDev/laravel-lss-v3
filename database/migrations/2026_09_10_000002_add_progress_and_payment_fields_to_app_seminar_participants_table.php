<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Registration Progress Checklist (5 freely-togglable admin steps, matching
 * the existing SeminarProgress frontend type) + Payment Information fields
 * (matching SeminarPaymentInfo) from the Seminar Module requirements doc.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('app_seminar_participants', function (Blueprint $table) {
            $table->boolean('registration_done')->default(true)->after('registered_at');
            $table->boolean('payment_done')->default(false)->after('registration_done');
            $table->boolean('seminar_proper_done')->default(false)->after('payment_done');
            $table->boolean('feedback_form_done')->default(false)->after('seminar_proper_done');
            $table->boolean('certificate_done')->default(false)->after('feedback_form_done');

            $table->string('payment_status')->default('Pending')->after('certificate_done');
            $table->date('payment_date')->nullable()->after('payment_status');
            $table->decimal('amount_paid', 10, 2)->nullable()->after('payment_date');
            $table->string('reference_no')->nullable()->after('amount_paid');
            $table->text('payment_remarks')->nullable()->after('reference_no');
        });
    }

    public function down(): void
    {
        Schema::table('app_seminar_participants', function (Blueprint $table) {
            $table->dropColumn([
                'registration_done', 'payment_done', 'seminar_proper_done',
                'feedback_form_done', 'certificate_done',
                'payment_status', 'payment_date', 'amount_paid', 'reference_no', 'payment_remarks',
            ]);
        });
    }
};
