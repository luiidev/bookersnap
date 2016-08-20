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

    public function SaveMicroportal(array $data, $user_id){
        $data['user_id'] = $user_id;
        $url = API_ADMIN_URL . '/es/microportal';
        return ApiRequestsHelper::SendRequest('POST', $url, null, $data);
    }
}