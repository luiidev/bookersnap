<?php
/**
 * Created by PhpStorm.
 * User: BS
 * Date: 07/09/2016
 * Time: 11:53
 */

namespace App\Services;

use App\Services\Helpers\ApiRequestsHelper;

class CountryService
{

    private $_api_admin_url;

    public function __construct()
    {
        $this->_api_admin_url = config('settings.API_ADMIN_URL');
    }

    /**
     * Determina el pais y el lenguaje del dominio al que se esta accediendo.
     * @param string $domain
     * @param string $path
     * @param string $ipAddress
     * @param bool $isSetHttpReferer
     * @return CheckCountryResponse
     */
    public function CheckCountryByIpAddress($domain, $path, $ipAddress, $isSetHttpReferer)
    {
        $url = $this->_api_admin_url . '/es/checkcountry';
        $data = [
            'domain' => $domain,
            'path' => $path,
            'ip' => $ipAddress,
            'http_referer' => $isSetHttpReferer
        ];
        return ApiRequestsHelper::SendRequest('POST', $url, null, $data);
    }
}