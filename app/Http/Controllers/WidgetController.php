<?php

namespace App\Http\Controllers;

use App\Http\Requests;
use App\Http\Requests\WidgetConfirmRequest;
use App\Services\Helpers\ApiRequestsHelper;
use App\Services\Helpers\HttpRequestHelper;
use Illuminate\Http\Request;
use Validator;

class WidgetController extends Controller
{
    // const _domain = "http://localhost:3004";
    const _domain = "http://localhost:3004/v1/es/microsites";

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

        $http = new HttpRequestHelper();

        $http->setMethod("GET");
        $http->setUrl(self::_domain."/".$site."/reservationtemporal/".$request->key);
        $http->send();

        if ($http->isOk()) {
            $response = $http->getArrayResponse();

            $data = array(
                "reservation" => (object) $response["data"]["reservation"],
                "forms" =>  $response["data"]["forms"],
                "time" =>  $response["data"]["time"],
                "microsite" => $site,
                "token" =>  $request->key
            );

            return view("widget.v2_2", $data);
        } else {
            $data = array(
                "message" => "La reservacion que busca no existe o ya expiro....",
                "microsite" => $site
            );

            return view("widget.error_reservation", $data);
        }
    }

    public function confirmed(Request $request, $site)
    {
        $validate = Validator::make($request->all(), ["key" => "required"]);

        if ($validate->fails()) {
            return redirect()->route("widget", ["site" => $site]);
        }

        $http = new HttpRequestHelper();

        $http->setMethod("GET");
        $http->setUrl(self::_domain."/".$site."/table/reservation/confirmed/".$request->key);
        $http->send();

        if ($http->isOk()) {
            $response = $http->getArrayResponse();

            $data = array(
                "reservation" =>(object) $response["data"],
                "microsite" => $site,
                "token" =>  $request->key
            );

            return view("widget.v2_3",  $data);
        } else {
            return redirect()->route("widget", ["site" => $site]);
        }
    }

    public function Reservationtemporal(Request $request, $site)
    {
        $http = new HttpRequestHelper("POST");
        $http->setUrl(self::_domain."/".$site."/reservationtemporal");
        $http->setHeader(["token" => $request->header("token")]);
        $http->setData($request->all());
        $http->send();

        if (!$http->isOk()) {
            return response( $http->getErrorResponse(), $http->getStatusCode());
        } else {
            return response( $http->getArrayResponse(), $http->getStatusCode());
        }
    }

    public function StoreReservation(Request $request, $site)
    {
        $url = self::_domain."/".$site."/table/reservation/w";

        $http = new HttpRequestHelper("POST", $url , $request->all());
        $http->send();

        if (!$http->isOk()) {
            return response( $http->getErrorResponse(), $http->getStatusCode());
        } else {
            return response( $http->getArrayResponse(), $http->getStatusCode());
        }
    }

    public function DeleteReservation(Request $request, $site, $token)
    {
        $url = self::_domain."/".$site."/table/reservation/cancel/".$token;

        $http = new HttpRequestHelper("POST", $url);
        $http->send();

        if (!$http->isOk()) {
            return response( $http->getErrorResponse(), $http->getStatusCode());
        } else {
            return response( $http->getArrayResponse(), $http->getStatusCode());
        }
    }

    public function DeleteReservationtemporal(Request $request, $site, $token)
    {
        $url = self::_domain."/".$site."/reservationtemporal/".$token;
        
        $http = new HttpRequestHelper("DELETE", $url);
        $http->send();

        if (!$http->isOk()) {
            return response( $http->getErrorResponse(), $http->getStatusCode());
        } else {
            return response( $http->getArrayResponse(), $http->getStatusCode());
        }
    }

    public function ShowReservationtemporal(Request $request, $site, $token)
    {
        $url = self::_domain."/".$site."/reservationtemporal/".$token;
        
        $http = new HttpRequestHelper("GET", $url);
        $http->send();

        if (!$http->isOk()) {
            return response( $http->getErrorResponse(), $http->getStatusCode());
        } else {
            return response( $http->getArrayResponse(), $http->getStatusCode());
        }
    }

    public function ShowDaysdisabled(Request $request, $site)
    {
        $url = self::_domain."/".$site."/availability/daysdisabled";
        
        $http = new HttpRequestHelper("GET", $url, $request->all());
        $http->send();

        if (!$http->isOk()) {
            return response( $http->getErrorResponse(), $http->getStatusCode());
        } else {
            return response( $http->getArrayResponse(), $http->getStatusCode());
        }
    }
}