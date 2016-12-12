<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\CheckAdminService;
use Session;
use App\OldUser;
use App\OldTokenSession;
use Illuminate\Http\Request;

class MainController extends Controller
{
    
    public function mesas(Request $request)
    {
        return view('dashboard.admin.mesas', ['acl' => 's', 'apitoken' => 'dsdsd', 'ms_id' => '1']);
        $user_id      = $this->GetUserId();
        $checkService = new CheckAdminService();
        try {
            //Verifica que el usuario que esta en sesion tiene permisos para entrar a la aplicacion
            //Si no, redirige.
            $id = $request->route('id');
            $response = $checkService->checkIfMsAdmin($user_id, $id);

            $token = Session::get('api-token');
            $data  = ['acl' => json_encode($response), 'apitoken' => $token, 'ms_id' => $id];
            return view('dashboard.admin.mesas', $data);
        } catch (\Exception $e) {
            return response()->redirectTo('/auth/auth');
        }
    }
    
    public function loginMesas() {
        
        $token = "tpnhi22hl6ic2414eqcou0l0k7";
        $microsite_id = 1;
        $tokenSession = OldTokenSession::where('token', $token)->first();
        if($tokenSession){
            return OldUser::where('id', $tokenSession->usermicrosite_id)->first();
//            return response()->redirectTo("/admin/ms/$microsite_id/mesas");
        }
        return response()->redirectTo('/auth/auth');
    }
    
    

}
