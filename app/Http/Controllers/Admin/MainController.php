<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\CheckAdminService;
use Session;

class MainController extends Controller
{

    public function mesas(int $id)
    {
        return view('dashboard.admin.mesas', ['acl' => 's', 'apitoken' => 'dsdsd', 'ms_id' => '1']);
        $user_id      = $this->GetUserId();
        $checkService = new CheckAdminService();
        try {
            //Verifica que el usuario que esta en sesion tiene permisos para entrar a la aplicacion
            //Si no, redirige.

            $response = $checkService->checkIfMsAdmin($user_id, $id);

            $token = Session::get('api-token');
            $data  = ['acl' => json_encode($response), 'apitoken' => $token, 'ms_id' => $id];
            return view('dashboard.admin.mesas', $data);
        } catch (\Exception $e) {
            return response()->redirectTo('/auth/auth');
        }
    }

}
