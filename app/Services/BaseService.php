<?php
namespace App\Services;

class BaseService
{

	protected function CreateJsonResponse($success, $statusCode, $msg = null, $data = null,
                                          $redirect = false, $url = null, $errorUserMsg = null,
                                          $errorInternalMsg = null, $arrayErrors = null)
    {
        $response = [
            "success" => $success,
            "statuscode" => $statusCode,
            "msg" => $msg,
            "data" => $data,
            "redirect" => $redirect,
            "url" => $url,
            "error" => [
                "user_msg" => $errorUserMsg,
                "internal_msg" => $errorInternalMsg,
                "errors" => $arrayErrors
            ]
        ];

        return response()->json($response, $statusCode);
    }

}