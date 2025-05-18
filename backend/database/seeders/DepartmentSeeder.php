<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Department;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $departments = [
            [
                'name' => 'Technologies de l\'Information',
                'description' => 'Département responsable des systèmes informatiques et de la technologie'
            ],
            [
                'name' => 'Ressources Humaines',
                'description' => 'Département responsable de la gestion du personnel'
            ],
            [
                'name' => 'Finance',
                'description' => 'Département responsable de la gestion financière'
            ],
            [
                'name' => 'Marketing',
                'description' => 'Département responsable de la promotion et des ventes'
            ],
            [
                'name' => 'Production',
                'description' => 'Département responsable des opérations de production'
            ],
            [
                'name' => 'Recherche et Développement',
                'description' => 'Département responsable de l\'innovation et du développement de produits'
            ]
        ];

        foreach ($departments as $department) {
            Department::firstOrCreate(
                ['name' => $department['name']],
                ['description' => $department['description']]
            );
        }
    }
}
