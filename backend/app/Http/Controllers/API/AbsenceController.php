<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Absence;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class AbsenceController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $query = Absence::with(['user', 'approver']);
        
        // Filter by user_id if provided
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        
        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        // Filter by type if provided
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        
        // Filter by date range if provided
        if ($request->has('start_date')) {
            $query->where(function($q) use ($request) {
                $q->where('start_date', '>=', $request->start_date)
                  ->orWhere('end_date', '>=', $request->start_date);
            });
        }
        
        if ($request->has('end_date')) {
            $query->where(function($q) use ($request) {
                $q->where('start_date', '<=', $request->end_date)
                  ->orWhere('end_date', '<=', $request->end_date);
            });
        }
        
        // Order by start_date by default
        $absences = $query->orderBy('start_date', 'desc')->get();
        
        return response()->json($absences);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
{
    $validator = Validator::make($request->all(), [
        'user_id' => 'required|exists:users,id',
        'start_date' => 'required|date',
        'end_date' => 'required|date|after_or_equal:start_date',
        'type' => ['required', Rule::in(['sick', 'vacation', 'personal', 'other'])],
        'reason' => 'required|string',
        'attachment' => 'nullable|file|mimes:jpg,png,pdf,docx,txt|max:2048', // التأكد من التحقق من نوع الملف
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    // Check for overlapping absences
    $overlapping = Absence::where('user_id', $request->user_id)
        ->where(function($query) use ($request) {
            $query->whereBetween('start_date', [$request->start_date, $request->end_date])
                ->orWhereBetween('end_date', [$request->start_date, $request->end_date])
                ->orWhere(function($q) use ($request) {
                    $q->where('start_date', '<=', $request->start_date)
                      ->where('end_date', '>=', $request->end_date);
                });
        })
        ->exists();

    if ($overlapping) {
        return response()->json([
            'message' => 'Une absence existe déjà pour cette période'
        ], 422);
    }

    // Save file if provided
    $attachment = null;
    if ($request->hasFile('attachment')) {
        $attachment = $request->file('attachment')->store('attachments', 'public'); // حفظ الملف في مجلد 'attachments' داخل 'storage/app/public'
    }

    $absence = new Absence();
    $absence->user_id = $request->user_id;
    $absence->start_date = $request->start_date;
    $absence->end_date = $request->end_date;
    $absence->type = $request->type;
    $absence->reason = $request->reason;
    $absence->attachment = $attachment;  // تخزين المسار للملف
    $absence->status = 'pending';
    $absence->save();

    return response()->json($absence, 201);
}


    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $absence = Absence::with(['user', 'approver'])->findOrFail($id);
        return response()->json($absence);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $absence = Absence::findOrFail($id);
    
        // Only allow updates if the absence is still pending
        if ($absence->status !== 'pending') {
            return response()->json([
                'message' => 'Impossible de modifier une absence déjà approuvée ou rejetée'
            ], 422);
        }
    
        $validator = Validator::make($request->all(), [
            'user_id' => 'sometimes|required|exists:users,id',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date|after_or_equal:start_date',
            'type' => ['sometimes', 'required', Rule::in(['sick', 'vacation', 'personal', 'other'])],
            'reason' => 'sometimes|required|string',
            'attachment' => 'sometimes|nullable|file|mimes:jpg,png,pdf,docx,txt|max:2048', // تحقق من نوع الملف
        ]);
    
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
    
        // Check for overlapping absences if dates are being updated
        if ($request->has('start_date') || $request->has('end_date')) {
            $start_date = $request->start_date ?? $absence->start_date;
            $end_date = $request->end_date ?? $absence->end_date;
    
            $overlapping = Absence::where('user_id', $absence->user_id)
                ->where('id', '!=', $id)
                ->where(function($query) use ($start_date, $end_date) {
                    $query->whereBetween('start_date', [$start_date, $end_date])
                        ->orWhereBetween('end_date', [$start_date, $end_date])
                        ->orWhere(function($q) use ($start_date, $end_date) {
                            $q->where('start_date', '<=', $start_date)
                              ->where('end_date', '>=', $end_date);
                        });
                })
                ->exists();
    
            if ($overlapping) {
                return response()->json([
                    'message' => 'Une absence existe déjà pour cette période'
                ], 422);
            }
        }
    
        // Save file if provided
        if ($request->hasFile('attachment')) {
            // Delete old attachment if exists
            if ($absence->attachment) {
                Storage::disk('public')->delete($absence->attachment);
            }
    
            // Save new file
            $absence->attachment = $request->file('attachment')->store('attachments', 'public');
        }
    
        // Update absence data
        if ($request->has('user_id')) $absence->user_id = $request->user_id;
        if ($request->has('start_date')) $absence->start_date = $request->start_date;
        if ($request->has('end_date')) $absence->end_date = $request->end_date;
        if ($request->has('type')) $absence->type = $request->type;
        if ($request->has('reason')) $absence->reason = $request->reason;
    
        $absence->save();
    
        return response()->json($absence);
    }
    

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $absence = Absence::findOrFail($id);
        
        // Only allow deletion if the absence is still pending
        if ($absence->status !== 'pending') {
            return response()->json([
                'message' => 'Impossible de supprimer une absence déjà approuvée ou rejetée'
            ], 422);
        }
        
        $absence->delete();

        return response()->json(['message' => 'Absence supprimée avec succès']);
    }

    /**
     * Approve an absence request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function approve(Request $request, $id)
    {
        $absence = Absence::findOrFail($id);
        
        // Check if the absence is already approved or rejected
        if ($absence->status !== 'pending') {
            return response()->json([
                'message' => 'Cette absence a déjà été traitée'
            ], 422);
        }
        
        $validator = Validator::make($request->all(), [
            'admin_id' => 'required|exists:users,id',
            'comments' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Check if the approver is an admin
        $admin = User::findOrFail($request->admin_id);
        if ($admin->role !== 'admin') {
            return response()->json([
                'message' => 'Seuls les administrateurs peuvent approuver les absences'
            ], 403);
        }
        
        $absence->approve($request->admin_id, $request->comments);
        
        return response()->json($absence);
    }

    /**
     * Reject an absence request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function reject(Request $request, $id)
    {
        $absence = Absence::findOrFail($id);
        
        // Check if the absence is already approved or rejected
        if ($absence->status !== 'pending') {
            return response()->json([
                'message' => 'Cette absence a déjà été traitée'
            ], 422);
        }
        
        $validator = Validator::make($request->all(), [
            'admin_id' => 'required|exists:users,id',
            'comments' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Check if the rejector is an admin
        $admin = User::findOrFail($request->admin_id);
        if ($admin->role !== 'admin') {
            return response()->json([
                'message' => 'Seuls les administrateurs peuvent rejeter les absences'
            ], 403);
        }
        
        $absence->reject($request->admin_id, $request->comments);
        
        return response()->json($absence);
    }
}
