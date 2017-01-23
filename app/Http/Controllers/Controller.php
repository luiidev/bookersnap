<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Auth\Access\AuthorizesResources;
use DB;

class Controller extends BaseController
{

    use AuthorizesRequests, AuthorizesResources, DispatchesJobs, ValidatesRequests;

    public function __construct()
    {

    }

    protected function TryCatch($closure)
    {
        $response = null;
        try {
            return $closure();
        } catch (HttpException $e) {
            $response = $this->CreateJsonResponse(false, $e->getStatusCode(), null, null, false, null, $e->getMessage(), $e->getMessage() . "\n" . "{$e->getFile()}: {$e->getLine()}");
        } catch (ModelNotFoundException $e) {
            $response = $this->CreateJsonResponse(false, 404, null, null, false, null, 'No se encontró el recurso solicitado.', $e->getMessage() . "\n" . "{$e->getFile()}: {$e->getLine()}");
        } catch (\Exception $e) {
            $response = $this->CreateJsonResponse(false, 500, null, null, false, null, "Ocurrió un error interno", $e->getMessage() . "\n" . "{$e->getFile()}: {$e->getLine()}");
        } catch (Mandrill_Error $e) {
            $response = $this->CreateJsonResponse(false, 500, null, null, false, null, "Ocurrió un error al enviar mensaje", $e->getMessage() . "\n" . "{$e->getFile()}: {$e->getLine()}");
        }
        return response()->json($response, $response['statuscode']);
    }

    protected function TryCatchDB($closure)
    {
        $response = null;
        try {
            DB::beginTransaction();
            $response = $closure();
            DB::commit();
            return $response;
        } catch (HttpException $e) {
            $response = $this->CreateJsonResponse(false, $e->getStatusCode(), null, null, false, null, $e->getMessage(), $e->getMessage() . "\n" . "{$e->getFile()}: {$e->getLine()}");
        } catch (ModelNotFoundException $e) {
            $response = $this->CreateJsonResponse(false, 404, null, null, false, null, 'No se encontró el recurso solicitado.', $e->getMessage() . "\n" . "{$e->getFile()}: {$e->getLine()}");
        } catch (\Exception $e) {
            $response = $this->CreateJsonResponse(false, 500, null, null, false, null, "Ocurrió un error interno", $e->getMessage() . "\n" . "{$e->getFile()}: {$e->getLine()}");
        }
        DB::rollBack();
        return response()->json($response, $response['statuscode']);
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
