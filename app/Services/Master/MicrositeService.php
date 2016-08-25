<?php
/**
 * Created by PhpStorm.
 * User: BS
 * Date: 17/08/2016
 * Time: 12:12
 */

namespace App\Services\Master;


use App\Services\Helpers\ApiRequestsHelper;

class MicrositeService
{
    private $_api_admin_url;

    public function __construct()
    {
        $this->_api_admin_url = config('settings.API_ADMIN_URL');
    }

    public function GetPageMicrosite(array $data)
    {
        $url = $this->_api_admin_url . '/es/microsite';
        return ApiRequestsHelper::SendRequest('PATCH', $url, null, $data);
    }

    public function SaveMicrosite(array $data, $user_id, $credentiales)
    {
        $data['user_id'] = $user_id;
        $url = $this->_api_admin_url . '/es/microsite';
        return ApiRequestsHelper::SendRequest('POST', $url, $credentiales, $data);
    }
}