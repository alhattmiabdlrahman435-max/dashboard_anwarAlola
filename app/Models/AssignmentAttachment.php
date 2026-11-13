<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AssignmentAttachment extends Model
{
    protected $fillable = ['assignment_id', 'url', 'original_name', 'mime', 'sort_order'];
}
