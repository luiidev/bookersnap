<?php

namespace App\Services\Tables;
use App\Services\Helpers\ApiRequestsHelper;
use App\Services\BaseService as Service;
use Lang;

class ZoneService extends Service {

    public function getAll($url) {

	    $data = ApiRequestsHelper::SendRequest('GET', $url, [], []);

	    if($data == null){
	    	$response = $this->CreateJsonResponse(false,404,null,[],null,null,trans('error.404'));
	    }else{
	    	$response = $this->CreateJsonResponse(true,200,null,$data);
	    }

	    return $response;

    }
      
}