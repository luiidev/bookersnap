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

    public function GetPageMicrosite(array $data)
    {
        $url = API_ADMIN_URL . '/es/microsite';
        return ApiRequestsHelper::SendRequest('PATCH', $url, null, $data);
    }

    public function SaveMicrosite(array $data, $user_id){
        $data['user_id'] = $user_id;
        $url = API_ADMIN_URL . '/es/microsite';
        return ApiRequestsHelper::SendRequest('POST', $url, null, $data);
    }
}