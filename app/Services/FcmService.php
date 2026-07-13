<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class FcmService
{
    /**
     * Send a push notification to a specific user's FCM token
     */
    public static function sendNotification($fcmToken, $title, $body, array $data = [])
    {
        if (empty($fcmToken)) {
            return false;
        }

        $credentialsPath = storage_path('app/firebase-service-account.json');

        if (!file_exists($credentialsPath)) {
            Log::warning("FCM Warning: Firebase credentials file not found at [{$credentialsPath}]. Push notifications will not be sent.");
            return false;
        }

        try {
            $credentials = json_decode(file_get_contents($credentialsPath), true);
            if (!$credentials || !isset($credentials['project_id'], $credentials['private_key'], $credentials['client_email'])) {
                Log::error("FCM Error: Invalid structure in firebase-service-account.json.");
                return false;
            }

            $projectId = $credentials['project_id'];
            $accessToken = self::getAccessToken($credentials);

            if (!$accessToken) {
                return false;
            }

            $url = "https://fcm.googleapis.com/v1/projects/{$projectId}/messages:send";

            // Prepare custom payload data
            $dataPayload = array_merge([
                'click_action' => 'FLUTTER_NOTIFICATION_CLICK',
            ], $data);

            // Ensure all data values are string types (required by Firebase v1 API)
            foreach ($dataPayload as $key => $value) {
                $dataPayload[$key] = (string)$value;
            }

            $response = Http::withToken($accessToken)
                ->post($url, [
                    'message' => [
                        'token' => $fcmToken,
                        'notification' => [
                            'title' => $title,
                            'body' => $body,
                        ],
                        'android' => [
                            'priority' => 'high',
                            'notification' => [
                                'channel_id' => 'high_importance_channel',
                                'sound' => 'default',
                                'icon' => 'ic_launcher',
                            ],
                        ],
                        'apns' => [
                            'headers' => [
                                'apns-priority' => '10',
                            ],
                            'payload' => [
                                'aps' => [
                                    'alert' => [
                                        'title' => $title,
                                        'body' => $body,
                                    ],
                                    'sound' => 'default',
                                    'badge' => 1,
                                    'content-available' => 1,
                                    'mutable-content' => 1,
                                ],
                            ],
                        ],
                        'data' => $dataPayload,
                    ]
                ]);

            if ($response->successful()) {
                Log::info("FCM Notification sent successfully to token: " . substr($fcmToken, 0, 15) . "...");
                return true;
            }

            Log::error("FCM Send Error: " . $response->body());
            return false;

        } catch (\Exception $e) {
            Log::error("FCM Exception: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get OAuth2 access token for Google Firebase API (cached for performance)
     */
    private static function getAccessToken($credentials)
    {
        return Cache::remember('fcm_access_token', 3000, function () use ($credentials) {
            try {
                $privateKey = $credentials['private_key'];
                $clientEmail = $credentials['client_email'];

                $header = json_encode(['alg' => 'RS256', 'typ' => 'JWT']);
                $now = time();
                $payload = json_encode([
                    'iss' => $clientEmail,
                    'scope' => 'https://www.googleapis.com/auth/firebase.messaging',
                    'aud' => 'https://oauth2.googleapis.com/token',
                    'iat' => $now,
                    'exp' => $now + 3600,
                ]);

                $base64UrlHeader = self::base64UrlEncode($header);
                $base64UrlPayload = self::base64UrlEncode($payload);

                $signatureInput = $base64UrlHeader . "." . $base64UrlPayload;
                
                $signature = '';
                openssl_sign($signatureInput, $signature, $privateKey, OPENSSL_ALGO_SHA256);
                
                $base64UrlSignature = self::base64UrlEncode($signature);
                $jwt = $signatureInput . "." . $base64UrlSignature;

                $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
                    'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                    'assertion' => $jwt,
                ]);

                if ($response->successful()) {
                    return $response->json()['access_token'] ?? null;
                }

                Log::error("Google OAuth token request failed: " . $response->body());
                return null;
            } catch (\Exception $e) {
                Log::error("Google OAuth token generation exception: " . $e->getMessage());
                return null;
            }
        });
    }

    private static function base64UrlEncode($data)
    {
        return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
    }
}
