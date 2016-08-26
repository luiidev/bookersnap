<?php

namespace App\Http\Controllers\Master\Role;

use App\Services\Master\RoleService;
use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;

class RoleController extends Controller
{

    protected $_roleService;
    protected $_credentiales;

    public function __construct(RoleService $roleService)
    {
        $this->_roleService = $roleService;
        $this->_credentiales = ['type-admin' => 1];
    }

    public function StoreRole(Request $request)
    {
        $response = $this->_roleService->SaveRole($request->all(), $this->GetUserId(), $this->_credentiales);
        return response()->json($response, $response['statuscode']);
    }

    public function UpdateRole(string $lang, int $id, Request $request)
    {
        $response = $this->_roleService->UpdateRole($id, $request->all(), $this->GetUserId(), $this->_credentiales);
        return response()->json($response, $response['statuscode']);
    }

    public function StorePrivilegesByRole(string $lang, int $id, Request $request)
    {
        $response = $this->_roleService->SavePrivilegesByRole($id, $request->all(), $this->GetUserId(), $this->_credentiales);
        return response()->json($response, $response['statuscode']);
    }

}
