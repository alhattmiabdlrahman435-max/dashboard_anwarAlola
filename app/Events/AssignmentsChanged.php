<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;

/**
 * يُبث عبر WebSocket (Reverb) عند إضافة واجب أو تعديله أو حذفه،
 * فتتحدث صفحة الواجبات في لوحة التحكم وتطبيق ولي الأمر في نفس اللحظة.
 * لا يحمل محتوى الواجب؛ كل طرف يعيد جلب ما يخصه من الخادم.
 */
class AssignmentsChanged implements ShouldBroadcastNow
{
    use Dispatchable;

    public function __construct(
        public string $action, // created | updated | deleted
        public int $assignmentId,
        public ?int $classId = null,
    ) {}

    public function broadcastOn(): array
    {
        return [new Channel('public-assignments')];
    }

    public function broadcastAs(): string
    {
        return 'assignments_changed';
    }

    public function broadcastWith(): array
    {
        return ['action' => $this->action, 'id' => $this->assignmentId, 'class_id' => $this->classId];
    }

    public static function safeDispatch(string $action, int $id, ?int $classId = null): void
    {
        try {
            broadcast(new self($action, $id, $classId));
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning("Reverb assignments broadcast failed ({$action} #{$id}): " . $e->getMessage());
        }
    }
}
