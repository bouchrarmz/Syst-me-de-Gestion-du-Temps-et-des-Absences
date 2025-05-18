<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Department;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Récupérer les départements
        $itDepartment = Department::where('name', 'Technologies de l\'Information')->first();
        $hrDepartment = Department::where('name', 'Ressources Humaines')->first();
        $financeDepartment = Department::where('name', 'Finance')->first();
        
        // Créer un utilisateur administrateur
        User::create([
            'name' => 'Admin OCP',
            'email' => 'admin@ocp.ma',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'department_id' => $itDepartment->id,
            'position' => 'Administrateur Système',
            'join_date' => '2020-01-01',
            'status' => 'active',
            'avatar' => 'https://ui-avatars.com/api/?name=Admin+OCP&background=0D8ABC&color=fff',
        ]);
        
        // Créer quelques employés
        User::create([
            'name' => 'Mohammed Alami',
            'email' => 'mohammed.alami@ocp.ma',
            'password' => Hash::make('password'),
            'role' => 'employee',
            'department_id' => $itDepartment->id,
            'position' => 'Développeur Full Stack',
            'join_date' => '2020-03-15',
            'status' => 'active',
            'avatar' => 'https://ui-avatars.com/api/?name=Mohammed+Alami&background=0D8ABC&color=fff',
        ]);
        
        User::create([
            'name' => 'Fatima Zahra',
            'email' => 'fatima.zahra@ocp.ma',
            'password' => Hash::make('password'),
            'role' => 'employee',
            'department_id' => $hrDepartment->id,
            'position' => 'Responsable RH',
            'join_date' => '2019-06-10',
            'status' => 'active',
            'avatar' => 'https://ui-avatars.com/api/?name=Fatima+Zahra&background=0D8ABC&color=fff',
        ]);
        
        User::create([
            'name' => 'Karim Benali',
            'email' => 'karim.benali@ocp.ma',
            'password' => Hash::make('password'),
            'role' => 'employee',
            'department_id' => $financeDepartment->id,
            'position' => 'Comptable',
            'join_date' => '2021-02-20',
            'status' => 'active',
            'avatar' => 'https://ui-avatars.com/api/?name=Karim+Benali&background=0D8ABC&color=fff',
        ]);
    }
}
