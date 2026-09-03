<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ResetPaymentsCommand extends Command
{
    protected $signature = 'finance:reset-payments';
    protected $description = 'Safely clear all student payments and reset fees to 0 without affecting other data';

    public function handle(): int
    {
        $this->info('Starting student payments reset...');

        // 1. Disable FK checks and clear payments table
        if (config('database.default') === 'sqlite') {
            DB::statement('PRAGMA foreign_keys = OFF;');
            DB::table('payments')->truncate();
            DB::statement('PRAGMA foreign_keys = ON;');
        } else {
            DB::statement('SET FOREIGN_KEY_CHECKS=0;');
            DB::table('payments')->truncate();
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        }

        // 2. Set default tuition_fee to 0 if it was 10000
        $updatedStudents = DB::table('students')->where('tuition_fee', 10000.00)->update(['tuition_fee' => 0.00]);

        $this->info("Successfully cleared all payment records.");
        $this->info("Updated {$updatedStudents} student tuition fees to 0.00.");
        $this->info("All students now have 0 paid fees.");

        return Command::SUCCESS;
    }
}
