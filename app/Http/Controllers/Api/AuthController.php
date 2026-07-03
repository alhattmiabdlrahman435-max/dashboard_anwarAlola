<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * تسجيل الدخول
     */
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
            'role'     => 'nullable|string',
        ]);

        $inputUsername = trim($request->username);
        $inputPassword = trim($request->password);

        // تنظيف أرقام الجوال المدخلة (مثلاً إزالة 966 أو الصفر البادئ)
        $phoneInputClean = preg_replace('/\D/', '', $inputPassword);
        if (str_starts_with($phoneInputClean, '966')) {
            $phoneInputClean = substr($phoneInputClean, 3);
        }
        if (str_starts_with($phoneInputClean, '05')) {
            $phoneInputClean = substr($phoneInputClean, 1);
        }

        // 1. Search user by national_id, username, or job_id
        $user = User::where('national_id', $inputUsername)
                    ->orWhere('username', $inputUsername)
                    ->orWhere('job_id', $inputUsername)
                    ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'اسم المستخدم أو كلمة المرور غير صحيحة',
            ], 401);
        }

        // 2. Check if password matches (either actual hashed password OR fallback phone number)
        $passwordMatches = Hash::check($inputPassword, $user->password) || 
                           ($user->phone && ($inputPassword === $user->phone || $phoneInputClean === $user->phone));

        if (!$passwordMatches) {
            return response()->json([
                'success' => false,
                'message' => 'اسم المستخدم أو كلمة المرور غير صحيحة',
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'هذا الحساب معطل، تواصل مع الإدارة',
            ], 403);
        }

        // تحديث وقت آخر دخول
        $user->update(['last_login' => now()]);

        // إنشاء Token
        $token = $user->createToken('anwar-alola-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'token'   => $token,
            'user'    => [
                'id'       => $user->id,
                'name'     => $user->name,
                'name_ar'  => $user->name_ar,
                'name_en'  => $user->name_en,
                'email'    => null,
                'username' => $user->username,
                'role'     => $user->role,
                'photo'    => $user->photo_url,
            ],
        ]);
    }

    /**
     * تسجيل الخروج
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم تسجيل الخروج بنجاح',
        ]);
    }

    /**
     * بيانات المستخدم الحالي
     */
    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'user'    => $request->user(),
        ]);
    }

    /**
     * تحديث صورة الملف الشخصي
     */
    public function updatePhoto(Request $request)
    {
        $request->validate([
            'photo' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $user = $request->user();

        if ($request->hasFile('photo')) {
            $file = $request->file('photo');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('uploads/avatars'), $filename);
            
            $url = asset('uploads/avatars/' . $filename);
            
            $user->update(['photo_url' => $url]);

            return response()->json([
                'success' => true,
                'message' => 'تم تحديث الصورة بنجاح',
                'photo_url' => $url
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'لم يتم العثور على ملف الصورة'
        ], 400);
    }

    /**
     * تغيير كلمة المرور
     */
    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6',
        ]);

        $user = $request->user();

        // Clean phone input for fallback check
        $phoneInputClean = preg_replace('/\D/', '', $request->current_password);
        if (str_starts_with($phoneInputClean, '966')) {
            $phoneInputClean = substr($phoneInputClean, 3);
        }
        if (str_starts_with($phoneInputClean, '05')) {
            $phoneInputClean = substr($phoneInputClean, 1);
        }

        // Check if current password matches (either actual hashed password OR fallback phone number)
        $currentPasswordMatches = Hash::check($request->current_password, $user->password) || 
                                  ($user->phone && ($request->current_password === $user->phone || $phoneInputClean === $user->phone));

        if (!$currentPasswordMatches) {
            return response()->json([
                'success' => false,
                'message' => 'كلمة المرور الحالية غير صحيحة'
            ], 400);
        }

        // 2. Save the new password
        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم تغيير كلمة المرور بنجاح'
        ]);
    }
}
