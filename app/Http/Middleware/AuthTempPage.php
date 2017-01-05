<?php

namespace App\Http\Middleware;

use Closure;
use App\OldTokenSession;
use App\OldMicrosite;
use App\OldPrivilegemicrosite;
use Symfony\Component\HttpKernel\Exception\HttpException;

class AuthTempPage
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

        if (@config("settings.STATUS_SESSION") == "1") {

            $session  = $request->session();

            //si es cualquier otro usuario
            if ($session->has('user_session')) {

                //si es usuario MASTER
                if(@$session->get('user_session') == "1"){return $next($request);}

                //buscar si este usuario tiene privilegios para acceder
                $OldPrivilegemicrosite = OldPrivilegemicrosite::leftJoin("privilege", "privilege.role_id", "=", "privilegemicrosite.role_id")
                                                              ->where('user_id', $session->get('user_session'))
                                                              ->where('microsite_id', $request->route('id'))
                                                              ->where(function($query){
                                                                        return $query->where("privilege.menu_id", "50060000") //sistema de mesas
                                                                                     ->orWhere("privilege.menu_id", "50030000"); //libro de reservaciones
                                                                    })->get();
                //var_dump($OldPrivilegemicrosite->count()); exit;
                if ($OldPrivilegemicrosite->count() > 0) {
                    return $next($request);
                }else{
                    //pagina de no acceso
                    return redirect($this->urlRedirectBookersnap());
                }
                
            }else{

                return redirect($this->urlRedirectBookersnap());
            }
    
        }else{
            return $next($request);
        }
    }
    
    
    //Session fallo, redireccionar hacia bookersnap.com,
    public function urlRedirectBookersnap() {
        $request = request();
        //$token = $request->input('token');
        $microsite_id = $request->route('id');
        if(@$microsite_id){
            $microsite = OldMicrosite::where('id', $microsite_id)->first();
            return config("settings.SYS_BOOKERSNAP")."/".$microsite->site;
        }else{
            return config("settings.SYS_BOOKERSNAP");
        }
    }

    //rediccionar a una pagina de error
    public function urlRedirectoPageError(){
        return config("settings.SYS_BOOKERSNAP");
    }
}
