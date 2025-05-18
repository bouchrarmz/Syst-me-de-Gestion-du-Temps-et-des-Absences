<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TimeEntry extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'date',
        'time_in',
        'time_out',
        'period',
        'status',
        'total_hours',
        'hourly_rate',
        'salary',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date' => 'date',
        'time_in' => 'string',
        'time_out' => 'string',
        'hourly_rate' => 'decimal:2',
        'salary' => 'decimal:2',
    ];

    /**
     * Get the user that owns the time entry.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
        
    }

    /**
     * Calculate total hours and salary when time_out is set.
     */
    public function calculateTotals()
    {
        if ($this->time_out && $this->time_out !== '--:--') {
            $timeIn = new \DateTime($this->time_in);
            $timeOut = new \DateTime($this->time_out);
            $interval = $timeIn->diff($timeOut);
            
            $hours = $interval->h;
            $minutes = $interval->i;
            $this->total_hours = sprintf('%dh%02dm', $hours, $minutes);
            
            $hoursDecimal = $hours + ($minutes / 60);
            $this->salary = $hoursDecimal * $this->hourly_rate;
            
            $this->status = 'completed';
            $this->save();
        }
    }
}
