<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Notification;

class Absence extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'start_date',
        'end_date',
        'type',
        'reason',
        'attachment',
        'status',
        'comments',
        'approved_by',
        'approved_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'approved_at' => 'datetime',
    ];

    /**
     * Get the user that owns the absence.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the user that approved the absence.
     */
    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Calculate the duration of the absence in days.
     */
    public function getDurationAttribute()
    {
        return $this->start_date->diffInDays($this->end_date) + 1;
    }

    /**
     * Approve the absence.
     */
    public function approve($adminId, $comments = null)
    {
        $this->status = 'approved';
        $this->approved_by = $adminId;
        $this->approved_at = now();
        
        if ($comments) {
            $this->comments = $comments;
        }
        
        // Créer une notification pour l'employé
        Notification::create([
            'user_id' => $this->user_id,
            'title' => 'Demande d\'absence approuvée',
            'message' => 'Votre demande d\'absence du ' . $this->start_date->format('d/m/Y') . 
                      ' au ' . $this->end_date->format('d/m/Y') . ' a été approuvée.',
            'type' => 'absence_approved',
            'read' => false,
            'data' => [
                'absence_id' => $this->id,
                'comments' => $this->comments
            ]
        ]);
        
        return $this->save();
    }

    /**
     * Reject the absence.
     */
    public function reject($adminId, $comments = null)
    {
        $this->status = 'rejected';
        $this->approved_by = $adminId;
        $this->approved_at = now();
        
        if ($comments) {
            $this->comments = $comments;
        }
        
        // Créer une notification pour l'employé
        Notification::create([
            'user_id' => $this->user_id,
            'title' => 'Demande d\'absence rejetée',
            'message' => 'Votre demande d\'absence du ' . $this->start_date->format('d/m/Y') . 
                      ' au ' . $this->end_date->format('d/m/Y') . ' a été rejetée.',
            'type' => 'absence_rejected',
            'read' => false,
            'data' => [
                'absence_id' => $this->id,
                'comments' => $this->comments
            ]
        ]);
        
        return $this->save();
    }
}
