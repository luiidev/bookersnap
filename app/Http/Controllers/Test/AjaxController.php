<?php

namespace App\Http\Controllers\Test;

use App\Services\AjaxService;
use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;
use Symfony\Component\HttpKernel\Exception\HttpException;

class AjaxController extends Controller
{

    protected $_ajaxService;

    public function __construct(AjaxService $ajaxService)
    {
        $this->_ajaxService = $ajaxService;
    }

    public function GetData()
    {
        try {
            $response = $this->_ajaxService->GetTestData();
            return response()->json($response, $response['statuscode']);
            return $this->CreateJsonResponse(true, $response['statuscode'], $response['msg'], $data);
        } catch (HttpException $e) {
            return $this->CreateJsonResponse(false, $e->getStatusCode(), null, null, false, null, $e->getMessage(), $e->getMessage() . "\n" . "{$e->getFile()}: {$e->getLine()}");
        } catch (\Exception $e) {
            return $this->CreateJsonResponse(false, 500, null, null, false, null, "Ocurrió un error interno", $e->getMessage() . "\n" . "{$e->getFile()}: {$e->getLine()}");
        }

    }
}
