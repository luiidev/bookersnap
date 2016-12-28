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
    public function handle($request, Closure $next)
    {
        /*var_dump(request()->server('HTTP_REFERER')); 
        var_dump(parse_url(request()->server('HTTP_REFERER'), PHP_URL_HOST));
        exit;*/
        # code...
        try{
            $session  = $request->session();
            //$request->input('token');
            if ($session->has('token_session')) {
                return $next($request);
            }else{
                return redirect($this->urlRedirectBookersnap());
            }
        }catch(HttpException $e){
            //            var_dump($e->getMessage());
        }catch(\Exception $e){
            //            var_dump($e->getMessage());
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
