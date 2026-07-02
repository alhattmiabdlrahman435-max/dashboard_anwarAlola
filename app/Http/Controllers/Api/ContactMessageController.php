<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\Request;

class ContactMessageController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:50',
            'type' => 'required|string|in:inquiry,suggestion,complaint',
            'message' => 'required|string',
        ]);

        $message = ContactMessage::create([
            'name' => $request->name,
            'phone' => $request->phone,
            'type' => $request->type,
            'message' => $request->message,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم إرسال رسالتك بنجاح وسنقوم بالرد عليك قريباً.',
            'contact_message' => $message,
        ], 201);
    }
}
