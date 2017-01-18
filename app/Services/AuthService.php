<?php
/**
 * Created by PhpStorm.
 * User: BS
 * Date: 03/08/2016
 * Time: 16:39
 */

namespace App\Services;

use App\Services\Helpers\ApiRequestsHelper;
use App\Services\Helpers\HttpRequestHelper;
use App\bs_user_session;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\HttpException;

class AuthService
{

    protected $_api_auth_url;

    public function __construct()
    {
        $this->_api_auth_url = config('settings.API_AUTH_URL');
    }

    public function ValidateSocialResponse(string $data = null)
    {
        if ($data == null) {
            abort(400, "Solicitud Inválida");
        }
        $response = json_decode($data, false);
        if ($response == null) {
            abort(400, "Solicitud Inválida");
        }

        if (!$response->success || $response->data == null || $response->statuscode != 200) {
            abort(500, $response->error->userMsg);
        }

        if ($response->data->user == null || $response->data->user->token == null) {
            abort(500, $response->error->userMsg);
        }

        return $response;
    }

    public function LoginSocialUserData($data)
    {
        $url = $this->_api_auth_url;
        $url .= '/es/auth/socialnetwork';

        $response = ApiRequestsHelper::SendRequest('POST', $url, [], $data->user);

        if ($response['success']) {
            return $response['data'];
        } else {
            abort($response['statuscode'], $response['msg']);
        }
        return null;
    }

    public function LoginBsUserData($email, $password, $user_agent = null, $client_ip = null, $expire = null)
    {
        if (strlen($email) == 0 || strlen($password) == 0) {
            abort(400, trans('messages.empty_user_or_password'));
        }
        $url = $this->_api_auth_url . '/es/auth/bookersnap';
        $data = [
            'email' => $email,
            'password' => $password,
            'user_agent' => $user_agent,
            'client_ip' => $client_ip,
            'expire' => $expire
        ];
        $response = HttpRequestHelper::make('POST', $url, $data)->send();

        if ($response->isOk()) {
            return $response->getArrayResponse();
        }

        return false;
    }

    /**
     * Guarda o actualiza en la tabla session user cada vez que un usuario inicia sesion
     * @param int $id_user
     * @param string $tokenKey cadena random de 10 digitos generada para guardar esta sesion, no confundir con el token de api
     * @param string $user_agent
     * @return void
     */
    public function saveSharedLoginToken(int $user_id, $token_key, $user_agent)
    {
        if (is_null($user_id) || is_null($token_key) || is_null($user_agent)) {
            abort("400", "Argumentos inválidos");
        }

        $count = bs_user_session::where('bs_user_id', $user_id)
            ->where('user_agent', $user_agent)->where('status', 0)->count();

        if ($count == 0) {
            $bs_user_session = new bs_user_session();
            $bs_user_session->user_agent = $user_agent;
            $bs_user_session->bs_user_id = $user_id;

            $max_id_session = bs_user_session::where('bs_user_id', $user_id)->max('id_session');
            if (is_null($max_id_session)) {
                $max_id_session = 0;
            }
            $bs_user_session->id_session = $max_id_session + 1;
            $bs_user_session->status = 1;
            $bs_user_session->session_token = $token_key;
            $bs_user_session->save();
        } else {
            bs_user_session::where('bs_user_id', $user_id)
                ->where('user_agent', $user_agent)->where('status', 0)
                ->update(['status' => 1, 'session_token' => $token_key]);
        }

    }

    /**
     * Verifica si existe una sesion activa en la tabla user session para el usuario indicado y el token.
     * @param int $id_user
     * @param string $key
     * @return bool
     */
    public function CheckBsAuthToken($user_id, $key)
    {
        if (is_null($user_id) || is_null($key)) {
            abort("400", "Argumentos inválidos");
        }

        $count = bs_user_session::where('bs_user_id', $user_id)->where('session_token', $key)->where('status', 1)->count();

        if ($count == 0) {
            abort("406", "Credenciales inválidas");
        }

        return true;
    }

    /**
     * Cambia de estado a 0 el la sesion en la tabla user session.
     * @param $user_id
     * @param $key
     * @return mixed
     */
    public function removeBsAuthToken($user_id, $key)
    {
        if (is_null($user_id) || is_null($key)) {
            abort("400", "Argumentos inválidos");
        }

        $count = bs_user_session::where('bs_user_id', $user_id)
            ->where('session_token', $key)->where('status', 1)->count();

        if ($count == 0) {
            abort("406", "Credenciales inválidas");
        }
        bs_user_session::where('bs_user_id', $user_id)
            ->where('session_token', $key)
            ->where('status', 1)
            ->update(['status' => 0]);
        return true;
    }

    public function logout()
    {
        $url = $this->_api_auth_url . '/es/auth/logout';
        $http = HttpRequestHelper::make('POST', $url)->send();
    }

}