<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\TimeEntry;
use App\Models\User;
use App\Models\Absence;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class TimeEntryController extends Controller
{
    // ... (index, store, show, update, destroy methods remain the same) ...
    public function index(Request $request)
    {
        $query = TimeEntry::with('user');
        
        // Filter by user_id if provided
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        
        // Filter by date if provided
        if ($request->has('date')) {
            $query->where('date', $request->date);
        }
        
        // Filter by period if provided
        if ($request->has('period')) {
            $query->where('period', $request->period);
        }
        
        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        // Order by date and time_in by default
        $timeEntries = $query->orderBy('date', 'desc')
                            ->orderBy('time_in', 'desc')
                            ->get();
        
        return response()->json($timeEntries);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'date' => 'required|date',
            'time_in' => 'required|date_format:H:i',
            'time_out' => 'nullable|date_format:H:i',
            'period' => ['required', Rule::in(['morning', 'afternoon'])],
            'status' => ['nullable', Rule::in(['in_progress', 'completed'])],
            'hourly_rate' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $existingEntry = TimeEntry::where('user_id', $request->user_id)
                                  ->where('date', $request->date)
                                  ->where('period', $request->period)
                                  ->first();
        
        if ($existingEntry) {
            return response()->json([
                'message' => 'Un pointage existe déjà pour cet utilisateur à cette date et période'
            ], 422);
        }

        $timeEntry = new TimeEntry();
        $timeEntry->user_id = $request->user_id;
        $timeEntry->date = $request->date;
        $timeEntry->time_in = $request->time_in;
        $timeEntry->time_out = $request->time_out ?? null;
        $timeEntry->period = $request->period;
        $timeEntry->status = $request->status ?? 'in_progress';
        $timeEntry->hourly_rate = $request->hourly_rate ?? 50.00;
        
        if ($request->time_out && $request->time_out !== '--:--') {
            try {
                $timeIn = Carbon::parse($request->time_in);
                $timeOut = Carbon::parse($request->time_out);
                
                if ($timeOut->lt($timeIn)) {
                    $timeOut->addDay();
                }
                
                $interval = $timeIn->diff($timeOut);
                
                $hours = $interval->h + ($interval->days * 24);
                $minutes = $interval->i;
                $timeEntry->total_hours = sprintf('%dh%02dm', $hours, $minutes);
                
                $hoursDecimal = $hours + ($minutes / 60);
                $timeEntry->salary = $hoursDecimal * $timeEntry->hourly_rate;
                $timeEntry->status = 'completed';
            } catch (\Exception $e) {
                Log::error('Error calculating time difference: ' . $e->getMessage());
                return response()->json(['message' => 'Format heure invalide pour le calcul.'], 422);
            }
        }
        
        $timeEntry->save();

        return response()->json($timeEntry, 201);
    }

    public function show($id)
    {
        $timeEntry = TimeEntry::with('user')->findOrFail($id);
        return response()->json($timeEntry);
    }

    public function update(Request $request, $id)
    {
        $timeEntry = TimeEntry::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'user_id' => 'sometimes|required|exists:users,id',
            'date' => 'sometimes|required|date',
            'time_in' => 'sometimes|required|date_format:H:i',
            'time_out' => 'sometimes|nullable|date_format:H:i',
            'period' => ['sometimes', 'required', Rule::in(['morning', 'afternoon'])],
            'status' => ['sometimes', 'nullable', Rule::in(['in_progress', 'completed'])],
            'hourly_rate' => 'sometimes|nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->has('user_id')) $timeEntry->user_id = $request->user_id;
        if ($request->has('date')) $timeEntry->date = $request->date;
        if ($request->has('time_in')) $timeEntry->time_in = $request->time_in;
        if ($request->has('period')) $timeEntry->period = $request->period;
        if ($request->has('hourly_rate')) $timeEntry->hourly_rate = $request->hourly_rate;
        
        if ($request->has('time_out')) {
            $timeEntry->time_out = $request->time_out;
            
            if ($request->time_out && $request->time_out !== '--:--') {
                 try {
                    $timeIn = Carbon::parse($timeEntry->time_in);
                    $timeOut = Carbon::parse($request->time_out);

                    if ($timeOut->lt($timeIn)) {
                        $timeOut->addDay();
                    }

                    $interval = $timeIn->diff($timeOut);
                    
                    $hours = $interval->h + ($interval->days * 24);
                    $minutes = $interval->i;
                    $timeEntry->total_hours = sprintf('%dh%02dm', $hours, $minutes);
                    
                    $hoursDecimal = $hours + ($minutes / 60);
                    $timeEntry->salary = $hoursDecimal * $timeEntry->hourly_rate;
                    $timeEntry->status = 'completed';
                } catch (\Exception $e) {
                    Log::error('Error calculating time difference during update: ' . $e->getMessage());
                    return response()->json(['message' => 'Format heure invalide pour le calcul.'], 422);
                }
            } else {
                 $timeEntry->time_out = null;
                 $timeEntry->total_hours = null;
                 $timeEntry->salary = null;
                 $timeEntry->status = 'in_progress';
            }
        }
        
        if ($request->has('status')) $timeEntry->status = $request->status;
        
        $timeEntry->save();

        return response()->json($timeEntry);
    }

    public function destroy($id)
    {
        $timeEntry = TimeEntry::findOrFail($id);
        $timeEntry->delete();

        return response()->json(['message' => 'Pointage supprimé avec succès']);
    }

    /**
     * Get time entries statistics for charts.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function stats(Request $request)
    {
        Log::info('TimeEntryController@stats: Starting statistics calculation.');
        try {
            Log::info('TimeEntryController@stats: Validating request parameters.', $request->all());
            $request->validate([
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date',
                'date' => 'nullable|date', // For single day distribution
            ]);
            Log::info('TimeEntryController@stats: Validation passed.');

            $endDate = Carbon::parse($request->input('end_date', Carbon::today()->toDateString()));
            $startDate = Carbon::parse($request->input('start_date', $endDate->copy()->subDays(6)->toDateString()));
            $distributionDate = Carbon::parse($request->input('date', Carbon::today()->toDateString()));
            Log::info('TimeEntryController@stats: Date range determined.', ['start' => $startDate->toDateString(), 'end' => $endDate->toDateString(), 'distribution' => $distributionDate->toDateString()]);

            // --- Calculate Daily Stats for Line Chart --- 
            Log::info('TimeEntryController@stats: Starting daily stats calculation.');
            $dailyStats = [];
            $currentDate = $startDate->copy();
            $standardStartTime = '09:00:00';
            $standardStartTimeCarbon = Carbon::parse($standardStartTime);

            while ($currentDate <= $endDate) {
                $dateStr = $currentDate->toDateString();
                Log::debug("TimeEntryController@stats: Processing daily stats for date: {$dateStr}");

                Log::debug("TimeEntryController@stats: Fetching time entries for {$dateStr}");
                $timeEntries = TimeEntry::where('date', $dateStr)
                                        ->where('period', 'morning')
                                        ->get();
                Log::debug("TimeEntryController@stats: Found ".count($timeEntries)." time entries for {$dateStr}");

                Log::debug("TimeEntryController@stats: Fetching absences for {$dateStr}");
                // *** CORRECTED: Use 'start_date' instead of 'date' for absences table ***
                $absencesCount = Absence::where('start_date', $dateStr) 
                                         ->where('status', 'approved')
                                         ->distinct('user_id')
                                         ->count();
                Log::debug("TimeEntryController@stats: Found {$absencesCount} absences for {$dateStr}");
                
                $presentCount = 0;
                $delayCount = 0;
                $userIdsPresentOrLate = [];

                foreach ($timeEntries as $entry) {
                    if (in_array($entry->user_id, $userIdsPresentOrLate)) {
                        continue;
                    }
                    $userIdsPresentOrLate[] = $entry->user_id;

                    try {
                        Log::debug("TimeEntryController@stats: Parsing time_in '{$entry->time_in}' for entry ID {$entry->id}");
                        $timeInCarbon = Carbon::parse($entry->time_in);
                        if ($timeInCarbon->gt($standardStartTimeCarbon)) {
                            $delayCount++;
                            Log::debug("TimeEntryController@stats: Entry ID {$entry->id} marked as delay.");
                        } else {
                            $presentCount++;
                            Log::debug("TimeEntryController@stats: Entry ID {$entry->id} marked as present.");
                        }
                    } catch (\Exception $e) {
                        Log::error("TimeEntryController@stats: Invalid time_in format for entry ID {$entry->id}: {$entry->time_in} on date {$dateStr}. Error: " . $e->getMessage());
                        continue;
                    }
                }
                
                $dailyStats[] = [
                    'date' => $currentDate->format('d/m'),
                    'presences' => $presentCount,
                    'delays' => $delayCount,
                    'absences' => $absencesCount,
                ];
                Log::debug("TimeEntryController@stats: Daily stats for {$dateStr}: ", $dailyStats[count($dailyStats)-1]);

                $currentDate->addDay();
            }
            Log::info('TimeEntryController@stats: Finished daily stats calculation.');

            // --- Calculate Distribution for Pie Chart --- 
            Log::info('TimeEntryController@stats: Starting distribution calculation.');
            $distributionDateStr = $distributionDate->toDateString();
            
            Log::debug("TimeEntryController@stats: Fetching total active employees.");
            $totalActiveEmployees = User::where('role', '!=', 'admin')->where('status', 'active')->count();
            Log::debug("TimeEntryController@stats: Found {$totalActiveEmployees} total active employees.");
            
            Log::debug("TimeEntryController@stats: Fetching time entries for distribution date {$distributionDateStr}");
            $timeEntriesForDist = TimeEntry::where('date', $distributionDateStr)
                                           ->where('period', 'morning')
                                           ->get();
            Log::debug("TimeEntryController@stats: Found ".count($timeEntriesForDist)." time entries for distribution date {$distributionDateStr}");
            
            Log::debug("TimeEntryController@stats: Fetching absences for distribution date {$distributionDateStr}");
            // *** CORRECTED: Use 'start_date' instead of 'date' for absences table ***
            $absencesForDistCount = Absence::where('start_date', $distributionDateStr) 
                                            ->where('status', 'approved')
                                            ->distinct('user_id')
                                            ->count();
            Log::debug("TimeEntryController@stats: Found {$absencesForDistCount} absences for distribution date {$distributionDateStr}");

            $presentForDist = 0;
            $delayForDist = 0;
            $userIdsPresentOrLateDist = [];

            foreach ($timeEntriesForDist as $entry) {
                if (!in_array($entry->user_id, $userIdsPresentOrLateDist)) {
                     $userIdsPresentOrLateDist[] = $entry->user_id;
                     try {
                         Log::debug("TimeEntryController@stats: Parsing time_in '{$entry->time_in}' for distribution entry ID {$entry->id}");
                         $timeInCarbon = Carbon::parse($entry->time_in);
                         if ($timeInCarbon->gt($standardStartTimeCarbon)) {
                            $delayForDist++;
                            Log::debug("TimeEntryController@stats: Distribution entry ID {$entry->id} marked as delay.");
                        } else {
                            $presentForDist++;
                            Log::debug("TimeEntryController@stats: Distribution entry ID {$entry->id} marked as present.");
                        }
                     } catch (\Exception $e) {
                         Log::error("TimeEntryController@stats: Invalid time_in format for distribution entry ID {$entry->id}: {$entry->time_in} on date {$distributionDateStr}. Error: " . $e->getMessage());
                         continue;
                     }
                }
            }
            
            $distribution = [
                'presences' => $presentForDist,
                'delays' => $delayForDist,
                'absences' => $absencesForDistCount,
                'total_employees' => $totalActiveEmployees
            ];
            Log::info('TimeEntryController@stats: Finished distribution calculation.', $distribution);

            Log::info('TimeEntryController@stats: Statistics calculation completed successfully.');
            return response()->json([
                'daily_stats' => $dailyStats,
                'distribution' => $distribution,
            ]);

        } catch (\Exception $e) {
            Log::error("TimeEntryController@stats: Error during statistics calculation: " . $e->getMessage() . "\nStack Trace:\n" . $e->getTraceAsString());
            return response()->json(['message' => 'Une erreur est survenue lors du calcul des statistiques.'], 500);
        }
    }
}
