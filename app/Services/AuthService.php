<?php
/**
 * Created by PhpStorm.
 * User: BS
 * Date: 03/08/2016
 * Time: 16:39
 */

namespace App\Services;

use App\Services\Helpers\ApiRequestsHelper;
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

    public function LoginBsUserData(string $email, string $password)
    {
        if (strlen($email) == 0 || strlen($password) == 0) {
            abort(400, trans('messages.empty_user_or_password'));
        }
        $url = $this->_api_auth_url . '/es/auth/bookersnap';
        $data = [
            'email' => $email,
            'password' => $password
        ];
        $response = ApiRequestsHelper::SendRequest('POST', $url, [], $data);

        if ($response['success']) {
            return $response['data'];
        } else {
            abort($response['statuscode'], $response['msg']);
        }
        return null;

    }

}