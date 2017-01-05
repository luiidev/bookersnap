<?php

namespace App\Http\Controllers;

use App\Http\Requests;
use App\Http\Requests\WidgetConfirmRequest;
use App\Services\Helpers\ApiRequestsHelper;
use Illuminate\Http\Request;
use Validator;

class WidgetController extends Controller
{
    const _domain = "http://apimesas.studework.com";

    public function index($site)
    {
        return view("widget.v2_1", ["microsite" => $site]);
    }

    public function confirm(Request $request, $site)
    {
        $validate = Validator::make($request->all(), ["key" => "required|string|max:124"]);
        
        if ($validate->fails()) {
            return redirect()->route("widget", array("site" => $site));
        }

        $url = self::_domain."/v1/es/microsites/".$site."/reservationtemporal/".$request->key;
        $response = ApiRequestsHelper::SendRequest("GET", $url, []);

        if (@$response["data"] === null) {
            $data = array(
                "message" => "La reservacion que busca no existe o ya expiro....",
                "microsite" => $site
            );

            return view("widget.error_reservation", $data);
        } else {
            $data = array(
                "reservation" => (object) $response["data"]["reservation"],
                "forms" =>  $response["data"]["forms"],
                "time" =>  $response["data"]["time"],
                "microsite" => $site,
                "token" =>  $request->key
            );

            return view("widget.v2_2", $data);
        }
    }

    public function confirmed(Request $request, $site)
    {
        $validate = Validator::make($request->all(), ["key" => "required"]);

        if ($validate->fails()) {
            return redirect()->route("widget", ["site" => $site]);
        }

        $url = self::_domain."/v1/es/microsites/".$site."/table/reservation/confirmed/".$request->key;

        $response = ApiRequestsHelper::SendRequest("GET", $url, []);

        if (@$response["data"] === null) {
            return redirect()->route("widget", ["site" => $site]);
        } else {
            $data = array(
                "reservation" =>(object) $response["data"],
                "microsite" => $site,
                "token" =>  $request->key
            );

            return view("widget.v2_3",  $data);
        }
    }
}