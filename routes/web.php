<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    $path = public_path('dist/index.html');
    if (!file_exists($path)) {
        return response()->json([
            'message' => 'مرحباً بك في الباكند الخاص بمدارس أنوار العلى',
            'status' => 'active',
            'api_version' => '1.0.0'
        ], 200, [], JSON_UNESCAPED_UNICODE);
    }
    return file_get_contents($path);
});

Route::fallback(function (\Illuminate\Http\Request $request) {
    if (preg_match('/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i', $request->path())) {
        abort(404);
    }
    $path = public_path('dist/index.html');
    if (file_exists($path)) {
        return file_get_contents($path);
    }
    abort(404);
});
