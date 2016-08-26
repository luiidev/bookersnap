<?php
/**
 * Created by PhpStorm.
 * User: BS
 * Date: 23/08/2016
 * Time: 11:14
 */

namespace App\Services;


use App\Services\Helpers\ApiRequestsHelper;

class CheckAdminService
{

    public function checkIfMaster($user_id)
    {
        $url = config('settings.API_AUTH_URL') . '/es/check-admin/master';
        $data = ['user_id' => $user_id];
        $response = ApiRequestsHelper::SendRequest('POST', $url, [], $data);
        if (!$response['success']) {
            abort(401, 'Unauthorized');
        } else {
            return $response['data'];
        }
    }
}