<?php

namespace App\Events;

use App\Models\Notification;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Queue\SerializesModels;

class BroadcastNotificationCreated implements ShouldBroadcastNow
{
    use InteractsWithSockets, SerializesModels;

    public $notification;
    public $student_id;
    public $parent_id;

    public function __construct(Notification $notification)
    {
        $this->notification = $notification->loadMissing('student');
        $this->student_id = $notification->student_id ? (string)$notification->student_id : null;
        
        if ($notification->student && $notification->student->parent_id) {
            $this->parent_id = (string)$notification->student->parent_id;
        }
    }

    public function broadcastOn()
    {
        $channels = [new Channel('public-notifications')];

        if ($this->parent_id) {
            $channels[] = new Channel('App.Models.User.' . $this->parent_id);
        }

        return $channels;
    }

    public function broadcastAs()
    {
        return 'Illuminate\\Notifications\\Events\\BroadcastNotificationCreated';
    }

    public function broadcastWith()
    {
        return [
            'id' => $this->notification->id,
            'title' => $this->notification->title,
            'content' => $this->notification->content,
            'type' => $this->notification->type,
            'student_id' => $this->student_id,
            'parent_id' => $this->parent_id,
            'created_at' => $this->notification->created_at ? $this->notification->created_at->toIso8601String() : now()->toIso8601String(),
        ];
    }
}
