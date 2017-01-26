<?php

namespace App\Http\Middleware;

use App\Services\Helpers\AuthHelper;
use Closure;
use JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;

class Authenticate
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
        try {
            $exp = 604800; // 1 semana en segundos

            $token_session = $request->session()->get("token_session");
            $JWTAuth =  JWTAuth::setToken($token_session);
            $token = $JWTAuth->getToken();

            if ($jwt = JWTAuth::decode($token)->get()) {
                $user_id = AuthHelper::getSession($jwt["aud"], $exp);
                if (! is_null($user_id) ) {
                    $request->request->set("_token_session", $token_session);
                    $request->request->set("_bs_user_id", $user_id);
                    $request->request->set("_bs_user_type_root", $jwt["type_root"]);
                    return $next($request);
                }
            }
        }
        catch (TokenExpiredException $e) {}
        catch (TokenInvalidException $e) {}
        catch (JWTException $e) {}

        return redirect()->guest(route('microsite-login'));
    }
}
