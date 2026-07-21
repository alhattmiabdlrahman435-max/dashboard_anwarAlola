<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

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

        // Debug logging
        $logMsg = sprintf("[%s] Login attempt: username='%s', password='%s'\n", date('Y-m-d H:i:s'), $inputUsername, $inputPassword);
        file_put_contents(storage_path('logs/login_debug.log'), $logMsg, FILE_APPEND);

        // تنظيف أرقام الجوال المدخلة (مثلاً إزالة 966 أو 967 أو الصفر البادئ)
        $phoneInputClean = preg_replace('/\D/', '', $inputPassword);
        if (str_starts_with($phoneInputClean, '967')) {
            $phoneInputClean = substr($phoneInputClean, 3);
        } elseif (str_starts_with($phoneInputClean, '966')) {
            $phoneInputClean = substr($phoneInputClean, 3);
        }
        if (str_starts_with($phoneInputClean, '07')) {
            $phoneInputClean = substr($phoneInputClean, 1);
        } elseif (str_starts_with($phoneInputClean, '05')) {
            $phoneInputClean = substr($phoneInputClean, 1);
        }

        // 1. Search user by national_id, username, job_id, or phone
        $user = User::where('national_id', $inputUsername)
                    ->orWhere('username', $inputUsername)
                    ->orWhere('job_id', $inputUsername)
                    ->orWhere('phone', $inputUsername)
                    ->first();

        if (!$user) {
            file_put_contents(storage_path('logs/login_debug.log'), "User not found in DB\n", FILE_APPEND);
            return response()->json([
                'success' => false,
                'message' => 'اسم المستخدم أو كلمة المرور غير صحيحة',
            ], 401);
        }

        // 2. Check if password matches strictly using Hash::check against stored hashed password
        $passwordMatches = Hash::check($inputPassword, $user->password);

        $logMatches = $passwordMatches ? "Yes" : "No";
        file_put_contents(storage_path('logs/login_debug.log'), sprintf("User ID=%d, Role=%s, DB Phone=%s, Password Matches=%s\n", $user->id, $user->role, $user->phone, $logMatches), FILE_APPEND);

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
                'id'          => $user->id,
                'name'        => $user->name,
                'name_ar'     => $user->name_ar,
                'name_en'     => $user->name_en,
                'email'       => null,
                'username'    => $user->username,
                'role'        => $user->role,
                'photo'       => $user->photo_url,
                'job_id'      => $user->job_id,
                'national_id' => $user->national_id,
                'phone'       => $user->phone,
                'address'     => $user->address,
                'permissions' => $user->permissions,
            ],
        ]);
    }

    /**
     * تسجيل الخروج
     */
    public function logout(Request $request)
    {
        if ($request->has('fcm_token')) {
            \App\Models\UserFcmToken::where('fcm_token', $request->fcm_token)->delete();
            if ($request->user() && $request->user()->fcm_token === $request->fcm_token) {
                $request->user()->update(['fcm_token' => null]);
            }
        }

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
            'photo' => 'required|image|mimes:jpeg,jpg,png,webp|max:5120',
        ]);

        $user = $request->user();

        if (!$request->hasFile('photo')) {
            return response()->json([
                'success' => false,
                'message' => 'لم يتم العثور على ملف الصورة'
            ], 400);
        }

        $file = $request->file('photo');
        $ext  = strtolower($file->getClientOriginalExtension());

        // UUID filename — prevents enumeration & collisions
        $filename    = Str::uuid() . '.' . $ext;
        $destination = public_path('uploads/avatars');
        $newPath     = $destination . DIRECTORY_SEPARATOR . $filename;

        // Move file to disk first
        $file->move($destination, $filename);
        $newUrl = asset('uploads/avatars/' . $filename);

        // Delete old photo (if exists and is a local file)
        $oldUrl = $user->photo_url;
        if ($oldUrl) {
            $oldRelative = str_replace(url('/'), '', $oldUrl);
            $oldAbsolute = public_path(ltrim($oldRelative, '/'));
            if (File::exists($oldAbsolute)) {
                File::delete($oldAbsolute);
            }
        }

        // Save to DB — rollback file on failure
        try {
            $user->update(['photo_url' => $newUrl]);
        } catch (\Throwable $e) {
            File::delete($newPath);
            return response()->json([
                'success' => false,
                'message' => 'فشل حفظ البيانات. يرجى المحاولة مرة أخرى.'
            ], 500);
        }

        return response()->json([
            'success'   => true,
            'message'   => 'تم تحديث الصورة بنجاح',
            'photo_url' => $newUrl,
        ]);
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
        if (str_starts_with($phoneInputClean, '967')) {
            $phoneInputClean = substr($phoneInputClean, 3);
        } elseif (str_starts_with($phoneInputClean, '966')) {
            $phoneInputClean = substr($phoneInputClean, 3);
        }
        if (str_starts_with($phoneInputClean, '07')) {
            $phoneInputClean = substr($phoneInputClean, 1);
        } elseif (str_starts_with($phoneInputClean, '05')) {
            $phoneInputClean = substr($phoneInputClean, 1);
        }

        // Check if current password matches stored hashed password
        $currentPasswordMatches = Hash::check($request->current_password, $user->password);

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

    /**
     * تحديث رمز FCM للجهاز
     */
    public function updateFcmToken(Request $request)
    {
        $request->validate([
            'fcm_token' => 'required|string',
        ]);

        // Enforce unique ownership: Delete this token from any other users
        \App\Models\UserFcmToken::where('fcm_token', $request->fcm_token)->delete();
        \App\Models\User::where('fcm_token', $request->fcm_token)->update(['fcm_token' => null]);

        // Associate token with the current authenticated user
        \App\Models\UserFcmToken::updateOrCreate(
            ['fcm_token' => $request->fcm_token],
            ['user_id' => $request->user()->id]
        );

        $request->user()->update([
            'fcm_token' => $request->fcm_token
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث رمز FCM بنجاح'
        ]);
    }

    /**
     * حذف رمز FCM للجهاز
     */
    public function deleteFcmToken(Request $request)
    {
        $request->validate([
            'fcm_token' => 'required|string',
        ]);

        \App\Models\UserFcmToken::where('fcm_token', $request->fcm_token)->delete();
        if ($request->user() && $request->user()->fcm_token === $request->fcm_token) {
            $request->user()->update(['fcm_token' => null]);
        }

        return response()->json([
            'success' => true,
            'message' => 'تم حذف رمز FCM بنجاح'
        ]);
    }
}
