<?php
/**
 * Created by PhpStorm.
 * User: BS
 * Date: 18/08/2016
 * Time: 18:18
 */

namespace App\Services\Master;


use App\Services\Helpers\ApiRequestsHelper;

class MicroportalService
{

    private $_api_admin_url;

    public function __construct()
    {
        $this->_api_admin_url = config('settings.API_ADMIN_URL');
    }

    public function SaveMicroportal(array $data, $user_id, array $credentiales)
    {
        $data['user_id'] = $user_id;
        $url = $this->_api_admin_url . '/es/microportal';
        return ApiRequestsHelper::SendRequest('POST', $url, $credentiales, $data);
    }
}