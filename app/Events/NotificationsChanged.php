<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;

/**
 * يُبث عبر WebSocket (Reverb) عند إرسال إشعار أو تعديله أو حذفه،
 * فيحدّث التطبيق قائمة الإشعارات في نفس اللحظة.
 * لا يحمل محتوى الإشعار، فقط نوع العملية ورقمه؛ التطبيق يجلب ما يخصه من الخادم.
 */
class NotificationsChanged implements ShouldBroadcastNow
{
    use Dispatchable;

    public function __construct(
        public string $action, // created | updated | deleted
        public int $notificationId,
    ) {}

    public function broadcastOn(): array
    {
        return [new Channel('public-notifications')];
    }

    public function broadcastAs(): string
    {
        return 'notifications_changed';
    }

    public function broadcastWith(): array
    {
        return [
            'action' => $this->action,
            'id' => $this->notificationId,
        ];
    }

    /** البث لا يجب أن يوقف الإرسال إذا كان خادم WebSocket متوقفاً */
    public static function safeDispatch(string $action, int $id): void
    {
        try {
            broadcast(new self($action, $id));
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning("Reverb broadcast failed ({$action} #{$id}): " . $e->getMessage());
        }
    }
}
