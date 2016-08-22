<?php

namespace App\Http\Controllers\Master\Role;

use App\Services\Master\RoleService;
use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;

class RoleController extends Controller
{

    protected $_roleService;

    public function __construct(RoleService $roleService)
    {
        $this->_roleService = $roleService;
    }

    public function StoreRole(Request $request)
    {
        $response = $this->_roleService->SaveRole($request->all(), $this->GetUserId());
        return response()->json($response, $response['statuscode']);
    }

    public function UpdateRole(string $lang, int $id, Request $request)
    {
        $response = $this->_roleService->UpdateRole($id, $request->all(), $this->GetUserId());
        return response()->json($response, $response['statuscode']);
    }

    public function StorePrivilegesByRole(string $lang, int $id, Request $request)
    {
        $response = $this->_roleService->SavePrivilegesByRole($id, $request->all(), $this->GetUserId());
        return response()->json($response, $response['statuscode']);
    }

}
