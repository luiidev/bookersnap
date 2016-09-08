<?php

namespace App\Http\Controllers\Admin;

use App\Services\CheckAdminService;
use Illuminate\Http\Request;
use App\Http\Requests;
use App\Http\Controllers\Controller;
use Session;

class MainController extends Controller {

    public function mesas($id) {
        return view('mesas');
        $user_id = $this->GetUserId();
        $checkService = new CheckAdminService();
        try {
            $response = $checkService->checkIfMsAdmin($user_id, $id);
            $token = Session::get('api-token');
            $data = ['acl' => json_encode($response), 'apitoken' => $token, 'ms_id' => $id]; 
            return view('mesas', $data);
        } catch (\Exception $e) {
            return response()->redirectTo('/');
        }
    }

}
