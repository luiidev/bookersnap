<?php
/**
 * Created by PhpStorm.
 * User: BS
 * Date: 08/08/2016
 * Time: 15:17
 */

namespace App\Services;


use App\Services\Helpers\ApiRequestsHelper;
use Config;
use Session;

class AjaxService
{

    private $_token;

    public function __construct()
    {
        $this->_token = Session::get('api-token');
    }


    public function GetTestData()
    {
        $url = Config::get("constants.url.api.admin");
        $url .= '/es/microsite/sitename';
        $credentials = [
            'Authorization' => 'Bearer ' . $this->_token,
            'type_admin' => 1
        ];
        $data = [
            'sitename' => 'don-titos',
            'free' => false
        ];
        $response = ApiRequestsHelper::SendRequest('POST', $url, $credentials, $data);

        switch ($response['statuscode']) {
            case 200: case 201:

                break;
            case 406:
                return [''];
                break;
            default:
                abort($response['statuscode'], trim($response['msg'] . $response['error']['user_msg']));
                break;
        }

        if ($response['success']) {
            return ['msg' => $response['msg'], 'statuscode' => $response['statuscode']];
        } else {
            return [
                'msg' => trim($response['msg'] . $response['error']['user_msg']),
                'suggestions' => $response['data']['suggestions'],
                'statuscode' => $response['statuscode']
            ];
        }
    }
}