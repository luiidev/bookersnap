<?php

namespace App\Http\Controllers;

use App\Http\Requests;
use App\Http\Requests\WidgetConfirmRequest;
use App\Services\Helpers\ApiRequestsHelper;
use Illuminate\Http\Request;
use Validator;

class WidgetController extends Controller
{
    public function index()
    {
        return view("widget.paso_1");
    }

    public function confirm(Request $request, $site)
    {
        // $rules = [
        //     "date"  => "required|date",
        //     "hour" => "required|numeric|digits:4|hour",
        //     "num"   => "required|integer|between:1,20"
        // ];

        $validate = Validator::make($request->all(), ["key" => "required|string|max:124"]);

        if ($validate->fails()) {
            return redirect()->route("widget", ["site" => $site]);
        }

        $url = "http://localhost:3004/v1/es/microsites/1/reservationtemporal/".$request->key;

        $response = ApiRequestsHelper::SendRequest("POST", $url, []);

        if (@$response["data"] === null) {
            // return view("error_reservation");
            return "La reservacion que busca no existe o ya expiro....";
        } else {
            return view("widget.paso_2", $response["data"]);
        }
    }
}
