<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Auth\Access\AuthorizesResources;

class Controller extends BaseController
{

    use AuthorizesRequests, AuthorizesResources, DispatchesJobs, ValidatesRequests;

    public function __construct()
    {

    }

    /**
     * @param bool $success
     * @param int $statuscode
     * @param string $msg
     * @param array $data
     * @param bool $redirect
     * @param string $url
     * @param string $errorUserMsg
     * @param string $errorInternalMsg
     * @param array $arrayErrors
     */
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

    protected function GetUserId()
    {
        $user = \Auth::user();
        if (is_null($user)) {
            return 1;
        }
        return $user->id;
    }

}
