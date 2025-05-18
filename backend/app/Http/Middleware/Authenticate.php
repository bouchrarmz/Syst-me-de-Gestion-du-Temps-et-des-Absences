<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     */
    protected function redirectTo(Request $request): ?string
    {
        // Au lieu de rediriger vers une route nommée "login"
        // return $request->expectsJson() ? null : route('login');
        
        // Retourner simplement une URL ou null pour les requêtes JSON
        return $request->expectsJson() ? null : '/api/unauthorized';
    }
}
