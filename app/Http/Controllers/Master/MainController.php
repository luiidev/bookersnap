<?php

namespace App\Http\Controllers\Master;

use App\Services\CheckAdminService;
use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;
use Session;

class MainController extends Controller
{

    public function index()
    {
        $user_id = $this->GetUserId();
        $checkService = new CheckAdminService();
        try {
            $response = $checkService->checkIfMaster($user_id);
            $token = Session::get('api-token');
            $data = ['acl' => json_encode($response), 'apitoken' => $token];
            return view('dashboard.master.layout', $data);
        } catch (\Exception $e) {
            return response()->redirectTo('/');
        }
    }
    
    public function mesas()
    {
        $user_id = $this->GetUserId();
        $checkService = new CheckAdminService();
        try {
            $response = $checkService->checkIfMaster($user_id);
            $token = Session::get('api-token');
            $data = ['acl' => json_encode($response), 'apitoken' => $token];
            return view('mesas', $data);
        } catch (\Exception $e) {
            return response()->redirectTo('/');
        }
    }
}
