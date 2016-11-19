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
//        $BSSESSID = $request->cookie('BSSESSID');
        try{
            $session  = $request->session();
            
            $OldTokenSession = OldTokenSession::where('token', $session->get('BSSESSID'))->first();
            $redirect = false;
            if($OldTokenSession){
                if($this->isRequestUri("/admin/auth")){
                    return redirect($this->urlRedirect());
                }
                return $next($request);
                
            }else if(request()->server('HTTP_REFERER')){
                return redirect($this->urlRedirect());
            }
            
        }catch(HttpException $e){
//            var_dump($e->getMessage());
        }catch(\Exception $e){
//            var_dump($e->getMessage());
        }
        
        return redirect($this->urlRedirectBookersnap());
    }
    
    public function isRequestUri($uri) {
        return (strpos(request()->server('REQUEST_URI'), $uri) === 0);
    }
    
    public function isHttpReferer($url) {
        return (strpos(request()->server('HTTP_REFERER'), $url) === 0);
    }
        
    public function urlRedirect() {
        $request = request();
        $token = $request->input('token');
        $microsite_id = $request->input('ms', null);
        $request->session()->set('BSSESSID', $token);
        if($microsite_id){
            return "/admin/ms/$microsite_id/mesas#/mesas/floor/reservation";
        }else{
            return "/admin";
        }
    }
    
    public function urlRedirectBookersnap() {
        $request = request();
        $token = $request->input('token');
        $microsite_id = $request->input('ms', null);
        if($microsite_id){
            $microsite = OldMicrosite::where('id', $microsite_id)->first();
            return "http://reservantro.com/".$microsite->site;
        }else{
            return "http://reservantro.com";
        }
    }
}
