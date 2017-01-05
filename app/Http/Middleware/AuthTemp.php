<?php

namespace App\Http\Middleware;

use Closure;
use App\OldTokenSession;
use App\OldMicrosite;
use Symfony\Component\HttpKernel\Exception\HttpException;

class AuthTemp
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next, $typeauth)
    {
        $session  = $request->session();
        //var_dump($typeauth); exit;
        /*var_dump($request->input('token')); echo "</br>";
        var_dump($request->route('id')); exit;*/
     
        if ($typeauth == "login") {
            try{
                $session  = $request->session();
                //$request->input('token');
                if (!$session->has('user_session')) {
                    if ($this->isHttpReferer(request()->server('HTTP_REFERER'))) {      
                        
                        $OldTokenSession = OldTokenSession::where('token', $request->input('token'))//verificar token
                                                          ->where('microsite_id', $request->route('id'))
                                                          ->where('status', 1)->first();

                        if($OldTokenSession){
                            $token = $request->input('token');
                            $session->set('user_session', $OldTokenSession->usermicrosite_id);
                            return redirect($this->urlRedirect());
                        }else
                            return redirect($this->urlRedirectBookersnap());
                    }else{
                        return redirect($this->urlRedirectBookersnap());
                    }
                }else{
                    return redirect()->away($this->urlRedirect());
                }
            }catch(HttpException $e){
                //            var_dump($e->getMessage());
            }catch(\Exception $e){
                //            var_dump($e->getMessage());
            }
            return redirect($this->urlRedirectBookersnap());
        }else{

            if ($session->has('user_session')) {
                $session->forget('user_session');
            }
            return redirect($this->urlRedirectBookersnap());
        }

    }

    
    public function isRequestUri($uri) {
        return (strpos(request()->server('REQUEST_URI'), $uri) === 0);
    }
    
    //verificar si el logeo viene del host de bookersnap (chilanguita, barezzito, etc)
    public function isHttpReferer($url_referer) {
        $host = parse_url(@$url_referer, PHP_URL_HOST);
        if ($host) {
            $host = "http://".$host;
            $OldMicrosite = OldMicrosite::where('domain', $host)->first();
            if ($OldMicrosite || $host == config("settings.SYS_BOOKERSNAP")) {
                return true;
            }else{
                return false;
            }
        }else{
            return false;
        }
    }
    
    //Session exitosa, redireccionar al una ruta angular
    public function urlRedirect() {
        $request = request();
        $microsite_id = $request->route('id');
        if ( !empty($request->input('service')) && !empty($request->input('url_angular')) ) {
            return "/admin/ms/$microsite_id/".$request->input('service')."#".$request->input('url_angular');
        }else{
            return "/";
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
}
