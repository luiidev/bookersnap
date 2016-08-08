<?php
/**
 * Created by PhpStorm.
 * User: BS
 * Date: 03/08/2016
 * Time: 16:39
 */

namespace App\Services;

use App\Services\Helpers\ApiRequestsHelper;
use Config;
use Symfony\Component\HttpKernel\Exception\HttpException;


class AuthService
{
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
        $url = Config::get("constants.url.api.auth");
        $url .= '/es/auth/socialnetwork';

        $response = ApiRequestsHelper::SendRequest('POST', $url, [], $data->user);

        if ($response['success']) {
            return $response['data'];
        } else {
            abort($response['statuscode'], $response['msg']);
        }
        return null;
    }

}