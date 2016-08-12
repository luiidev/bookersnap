<?php

namespace App\Services\Tables;
use App\Services\Helpers\ApiRequestsHelper;
use App\Services\BaseService as Service;
use Lang;

class ZoneService extends Service {

    public function getAll($url) {

	    $data = ApiRequestsHelper::SendRequest('GET', $url, [], []);

	    return $data;

    }
      
}