<?php

namespace App\Http\Controllers\Master\Microsite;

use App\Services\Master\MicrositeService;
use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;

class MicrositeController extends Controller
{

    protected $_micrositeService;
    protected $_credentiales;

    public function __construct(MicrositeService $micrositeService)
    {
        $this->_micrositeService = $micrositeService;
        $this->_credentiales = ['type-admin' => 1];
    }

    public function showPageMicrosite(Request $request)
    {
        $response = $this->_micrositeService->GetPageMicrosite($request->all());
        return response()->json($response, $response['statuscode']);
    }

    public function storeMicrosite(Request $request)
    {
        $response = $this->_micrositeService->SaveMicrosite($request->all(), $this->GetUserId(), $this->_credentiales);
        return response()->json($response, $response['statuscode']);
    }

}
