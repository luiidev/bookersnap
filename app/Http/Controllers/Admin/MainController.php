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
        return view('dashboard.admin.mesas', [
            'acl' =>json_encode($request->_privileges),
            'token_session' => $request->_token_session,
            'microsite_id' => $request->route("microsite_id")
        ]);
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
