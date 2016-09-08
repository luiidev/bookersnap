<?php

namespace App\Http\Middleware;

use Closure;
use App;

class CheckCountry
{
    /**
     * Handle an incoming request.
     * MIDDLEWARE QUE SERVIRA PARA LA REDIRECCION A LAS PAGINAS SEGUN LA IP POR PAIS
     *
     * @param  \Illuminate\Http\Request $request
     * @param  \Closure $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {

        $domain = request()->server('SERVER_NAME');
        $mainDomain = config('settings.MAIN_DOMAIN');

        //Si es dominio principal ejem: reservantro.com, reservantro.com.mx, etc
        if (strpos($domain, $mainDomain) !== false) {
            $isSetHttpReferer = (is_null($request->server('HTTP_REFERER')) ? false : true);
            $countryService = $this->makeCountryService();
            //$ip = $request->ip(); descomentar en produccion
            $ip = '77.50.101.152';
            //$ip = '187.156.15.8';
            //$ip = '80.38.43.128';

            try {
                //consulta al api si es necesario redireccionar y/o que idioma setear en la aplicacion
                $response = $countryService->CheckCountryByIpAddress($domain, $request->path(), $ip, $isSetHttpReferer);
            } catch (\Exception $e) {
                $response = [
                    'redirect' => false
                ];
            }

            if ($response['redirect']) {
                //redirecciona a la url indicada por el api
                return redirect($response['url']);
            }
            //Asigna el idioma a la aplicacion
            app()->setLocale($response['data']['bs_country_id']);
        }

        return $next($request);
    }

    /**
     * @return App\Services\CountryService
     */
    private function makeCountryService()
    {
        return app()->make('App\Services\CountryService');
    }
}
