<?php

use App\Http\Controllers\Api\SchoolReportController;
use Illuminate\Support\Facades\Route;

// Loaded inside the existing auth:sanctum group. Reports only expose read operations.
Route::get('/school-reports/options', [SchoolReportController::class, 'options']);
Route::get('/school-reports/students', [SchoolReportController::class, 'students']);
Route::get('/school-reports/{key}', [SchoolReportController::class, 'show']);
