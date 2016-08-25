<?php

namespace App\Http\Controllers\Master\Microportal;

use App\Services\Master\MicroportalService;
use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;

class MicroportalController extends Controller
{

    protected $_microportalService;
    protected $_credentiales;

    public function __construct(MicroportalService $microportalService)
    {
        $this->_microportalService = $microportalService;
        $this->_credentiales = ['type-admin' => 1];
    }

    public function StoreMicroportal(Request $request)
    {
        $response = $this->_microportalService->SaveMicroportal($request->all(), $this->GetUserId(), $this->_credentiales);
        return response()->json($response, $response['statuscode']);
    }
}
