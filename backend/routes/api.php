<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\DepartmentController;
use App\Http\Controllers\API\TimeEntryController;
use App\Http\Controllers\API\AbsenceController;
use App\Http\Controllers\API\NotificationController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Routes publiques
Route::post('/login', [AuthController::class, 'login']);

// Route pour gérer les requêtes non autorisées
Route::get('/unauthorized', function () {
    return response()->json(['message' => 'Non autorisé'], 401);
});

// Route nommée login pour éviter l'erreur de redirection
Route::get('/login', function () {
    return redirect('/');  // Rediriger vers la page d'accueil du frontend
})->name('login');

// Routes protégées
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // Users routes
    Route::apiResource('users', UserController::class);
    
    // Departments routes
    Route::apiResource('departments', DepartmentController::class);
    Route::get('/departments/{id}/users', [DepartmentController::class, 'users']);
    
    // Time entries routes
    Route::apiResource('time-entries', TimeEntryController::class);
    Route::get('/time-entries-stats', [TimeEntryController::class, 'stats']);
    
    // Absences routes
    Route::apiResource('absences', AbsenceController::class);
    Route::post('/absences/{id}/approve', [AbsenceController::class, 'approve']);
    Route::post('/absences/{id}/reject', [AbsenceController::class, 'reject']);
    Route::post('/absences', [AbsenceController::class, 'store']);

    // Notifications routes
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'getUnreadCount']);
});
