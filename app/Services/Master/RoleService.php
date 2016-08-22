<?php
/**
 * Created by PhpStorm.
 * User: BS
 * Date: 19/08/2016
 * Time: 13:29
 */

namespace App\Services\Master;


use App\Services\Helpers\ApiRequestsHelper;

class RoleService
{

    public function SaveRole(array $data, int $user_id)
    {
        $data['user_id'] = $user_id;
        $url = API_ADMIN_URL . '/es/roles';
        return ApiRequestsHelper::SendRequest('POST', $url, null, $data);
    }

    public function UpdateRole(int $id, array $data, int $user_id)
    {
        $data['user_id'] = $user_id;
        $option = '';
        if (@$data['option'] == 'status') {
            $option = '?option=status';
        }
        $url = API_ADMIN_URL . '/es/roles/' . $id . $option;
        return ApiRequestsHelper::SendRequest('PUT', $url, null, $data);
    }

    public function SavePrivilegesByRole(int $id, array $data, int $user_id)
    {
        $data['user_id'] = $user_id;
        $url = API_ADMIN_URL . '/es/roles/' . $id . '/privileges';
        return ApiRequestsHelper::SendRequest('POST', $url, null, $data);
    }

}