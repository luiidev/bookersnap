<?php

namespace App\Http\Middleware;

use Closure;

class CheckSocialLoginToken
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  \Closure $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        $token = $request->session()->pull('securitySocialLoginToken');
        if ($token != $request->input('secutiryToken')) {
            //abort(403, "El token de autorización ya expiró o no existe.");
            return redirect()->route('microsite-login')->with('error-message', 'El token de autorización ya expiró o no existe.');
        }
        return $next($request);
    }
}
