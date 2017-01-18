<?php

namespace App\Http\Middleware;

use App\Services\Helpers\PrivilegeHelper;
use Closure;

class ManagerMicrosite
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string|null  $guard
     * @return mixed
     */
    public function handle($request, Closure $next, $guard = null)
    {
        $privileges =  PrivilegeHelper::getPrivileges($request->_bs_user_id, $request->route("microsite_id"), 2);

        if (count($privileges) > 0) {
            $request->_privileges = $privileges;
            return $next($request);
        } else {
            return view("error.404");
        }
    }
}
