<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Department; // Importer le modèle Department
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Créer des départements d'abord
        $departments = [
            ['name' => 'IT'],
            ['name' => 'RH'],
            ['name' => 'Finance'],
        ];

        foreach ($departments as $dept) {
            Department::create($dept);
        }

        // Créer un admin
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'adminocp@ocp.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'department_id' => 1, // Assigner à un département existant (ID 1 = IT)
            'position' => 'Administrateur système',
            'join_date' => '2024-01-01',
            'status' => 'active',
        ]);

        // Créer des employés
        $employees = [
            [
                'name' => 'ismail Doe',
                'email' => 'ismail@example.com',
                'password' => Hash::make('password'),
                'role' => 'employee',
                'department_id' => 1, // Assigner à un département existant (ID 1 = IT)
                'position' => 'Développeur',
                'join_date' => '2024-02-01',
                'status' => 'active',
            ],
            [
                'name' => 'hamza Smith',
                'email' => 'hamza@example.com',
                'password' => Hash::make('password'),
                'role' => 'employee',
                'department_id' => 2, // Assigner à un département existant (ID 2 = RH)
                'position' => 'Recruteur',
                'join_date' => '2024-03-01',
                'status' => 'active',
            ],
            [
                'name' => 'mohammed Johnson',
                'email' => 'mohammed@example.com',
                'password' => Hash::make('password'),
                'role' => 'employee',
                'department_id' => 3, // Assigner à un département existant (ID 3 = Finance)
                'position' => 'Comptable',
                'join_date' => '2024-04-01',
                'status' => 'active',
            ],
        ];

        foreach ($employees as $emp) {
            User::create($emp);
        }
    }
}

