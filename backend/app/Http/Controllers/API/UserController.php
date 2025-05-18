<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Désactiver temporairement l'authentification pour le débogage
     */
    public function __construct()
    {
        // Commentez cette ligne pour désactiver l'authentification temporairement
        // $this->middleware('auth:sanctum');
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $users = User::with('department')->get();
        
        // Format response for frontend compatibility
        $formattedUsers = $users->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'department' => $user->department_name,
                'position' => $user->position,
                'join_date' => $user->join_date,
                'status' => $user->status,
                'avatar' => $user->avatar,
            ];
        });
        
        return response()->json($formattedUsers);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        \Log::info('Données reçues pour création d\'utilisateur:', $request->all());
        
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => ['required', Rule::in(['admin', 'employee'])],
            'department' => 'required|string|exists:departments,name',
            'position' => 'nullable|string|max:255',
            'join_date' => 'nullable|date',
            'status' => ['nullable', Rule::in(['active', 'inactive', 'vacation'])],
            'avatar' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            \Log::error('Validation échouée:', $validator->errors()->toArray());
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Find department by name
        $department = Department::where('name', $request->department)->first();
        
        if (!$department) {
            \Log::error('Département non trouvé:', $request->department);
            return response()->json(['message' => 'Département non trouvé'], 404);
        }

        try {
            $user = new User();
            $user->name = $request->name;
            $user->email = $request->email;
            $user->password = Hash::make($request->password);
            $user->role = $request->role;
            $user->department_id = $department->id;
            $user->position = $request->position;
            $user->join_date = $request->join_date;
            $user->status = $request->status ?? 'active';
            $user->avatar = $request->avatar;
            $user->save();
            
            \Log::info('Utilisateur créé avec succès:', ['id' => $user->id, 'name' => $user->name]);

            return response()->json([
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'department' => $user->department_name,
                'position' => $user->position,
                'join_date' => $user->join_date,
                'status' => $user->status,
                'avatar' => $user->avatar,
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Erreur lors de la création de l\'utilisateur:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Erreur lors de la création de l\'utilisateur: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $user = User::with('department')->findOrFail($id);
        
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'department' => $user->department_name,
            'position' => $user->position,
            'join_date' => $user->join_date,
            'status' => $user->status,
            'avatar' => $user->avatar,
        ]);
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
        $user = User::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'email' => [
                'sometimes',
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($id),
            ],
            'password' => 'sometimes|nullable|string|min:8',
            'role' => ['sometimes', 'required', Rule::in(['admin', 'employee'])],
            'department' => 'sometimes|required|string|exists:departments,name',
            'position' => 'sometimes|nullable|string|max:255',
            'join_date' => 'sometimes|nullable|date',
            'status' => ['sometimes', 'nullable', Rule::in(['active', 'inactive', 'vacation'])],
            'avatar' => 'sometimes|nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->has('name')) $user->name = $request->name;
        if ($request->has('email')) $user->email = $request->email;
        if ($request->has('password') && $request->password) $user->password = Hash::make($request->password);
        if ($request->has('role')) $user->role = $request->role;
        
        if ($request->has('department')) {
            $department = Department::where('name', $request->department)->first();
            if ($department) {
                $user->department_id = $department->id;
            }
        }
        
        if ($request->has('position')) $user->position = $request->position;
        if ($request->has('join_date')) $user->join_date = $request->join_date;
        if ($request->has('status')) $user->status = $request->status;
        if ($request->has('avatar')) $user->avatar = $request->avatar;
        
        $user->save();

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'department' => $user->department_name,
            'position' => $user->position,
            'join_date' => $user->join_date,
            'status' => $user->status,
            'avatar' => $user->avatar,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'Utilisateur supprimé avec succès']);
    }
}
