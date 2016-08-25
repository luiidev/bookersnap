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
    private $_api_admin_url;

    public function __construct()
    {
        $this->_api_admin_url = config('settings.API_ADMIN_URL');
    }

    public function SaveRole(array $data, int $user_id, array $credentials)
    {
        $data['user_id'] = $user_id;
        $url = $this->_api_admin_url . '/es/roles';
        return ApiRequestsHelper::SendRequest('POST', $url, $credentials, $data);
    }

    public function UpdateRole(int $id, array $data, int $user_id, array $credentials)
    {
        $data['user_id'] = $user_id;
        $option = '';
        if (@$data['option'] == 'status') {
            $option = '?option=status';
        }
        $url = $this->_api_admin_url . '/es/roles/' . $id . $option;
        return ApiRequestsHelper::SendRequest('PUT', $url, $credentials, $data);
    }

    public function SavePrivilegesByRole(int $id, array $data, int $user_id, array $credentials)
    {
        $data['user_id'] = $user_id;
        $url = $this->_api_admin_url . '/es/roles/' . $id . '/privileges';
        return ApiRequestsHelper::SendRequest('POST', $url, $credentials, $data);
    }

}