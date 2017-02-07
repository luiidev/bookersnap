<?php

namespace App\Http\Middleware;

use App\Services\Helpers\PrivilegeHelper;
use Closure;

use App\MsMicrosite;

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
        
        if ($request->_bs_user_type_root === 1) {
            $request->request->set("_privileges",  ["adminms-table-root"]);
            return $next($request);
        }

        $privileges =  PrivilegeHelper::getPrivileges($request->_bs_user_id, $request->route("microsite_id"), 2);

        if (count($privileges) > 0) {
            $request->request->set("_privileges",  $privileges);
            return $next($request);
        } else {
            //return redirect()->route('microsite-login')->with('error-message', 'Aun no cuenta con privilegios para ingresar.');
            return redirect($this->urlRedirectBookersnap());
        }
    }

    public function urlRedirectBookersnap() {
        $request = request();
        //$token = $request->input('token');
        $microsite_id = $request->route('microsite_id');
        if(@$microsite_id){
            $microsite = MsMicrosite::where('id', $microsite_id)->first();
            return config("settings.SYS_BOOKERSNAP")."/".$microsite->site_name;
        }else{
            return config("settings.SYS_BOOKERSNAP");
        }
    }
}
