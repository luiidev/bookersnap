<?php

namespace App\Http\Middleware;

use Closure;
use Lang;

class RouteMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        Lang::setLocale($request->lang); 
        
        return $next($request);
       
    }
}
