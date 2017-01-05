<?php

namespace App\Http\Controllers;

use App\Http\Requests;
use App\Http\Requests\WidgetConfirmRequest;
use App\Services\Helpers\ApiRequestsHelper;
use App\Services\Helpers\HttpRequestHelper;
use App\TempMicrosite;
use Illuminate\Http\Request;
use Validator;

class WidgetController extends Controller
{
    private $_domain;

    protected $site;

    function __construct()
    {
        $this->_domain = config("settings.API_URL");
    }

    public function index(Request $request, $site)
    {
        return view("widget.v2_1", ["microsite" => $site]);
    }

    public function confirm(Request $request, $site)
    {
        $validate = Validator::make($request->all(), ["key" => "required|string|max:124"]);
        
        if ($validate->fails()) {
            return redirect()->route("widget", array("site" => $site));
        }

        $http = HttpRequestHelper::make("GET")
            ->setUrl($this->url("/reservationtemporal/".$request->key))
            ->setHeader($this->AppID())
            ->send();

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

        $http = HttpRequestHelper::make("GET")
            ->setUrl($this->url("/table/reservation/confirmed/".$request->key))
            ->setHeader($this->AppID())
            ->send();

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

    public function StoreReservationtemporal()
    {
        $http = HttpRequestHelper::make("POST")
            ->setUrl($this->url("/reservationtemporal"))
            ->setHeader( [
                    "token" => $this->session(),
                    "appid" => $this->AppID(true)
            ])
            ->setData(request()->all())
            ->send();

        return $this->apiResponse($http);
    }

    public function FormatAvailability(Request $request, $site)
    {
        $url = $this->url("/availability/formatAvailability");
        $data = $request->all();

        $http = HttpRequestHelper::make("GET", $url , $data)
            ->setHeader($this->AppID())
            ->send();

        return $this->apiResponse($http);
    }

    public function Basic(Request $request, $site)
    {
        $url = $this->url("/availability/basic");
        $data = $request->all();

        $http = HttpRequestHelper::make("GET", $url , $data)
            ->setHeader($this->AppID())
            ->send();

        return $this->apiResponse($http);
    }

    public function StoreReservation(Request $request, $site)
    {
        $url = $this->url("/table/reservation/w");
        $data = $request->all();

        $http = HttpRequestHelper::make("POST", $url , $data)
            ->setHeader([
                    "token" => $this->session(),
                    "appid" => $this->AppID(true)
            ])
            ->send();

        return $this->apiResponse($http);
    }

    public function DeleteReservation(Request $request, $site, $token)
    {
        $url = $this->url("/table/reservation/cancel/".$token);

        $http = HttpRequestHelper::make("POST", $url)
            ->setHeader($this->AppID())
            ->send();

        return $this->apiResponse($http);
    }

    public function DeleteReservationtemporal()
    {
        $url = $this->url("/reservationtemporal/".$this->session());
        
        $http = HttpRequestHelper::make("DELETE", $url)
            ->setHeader($this->AppID())
            ->send();

        return $this->apiResponse($http);
    }

    public function ShowReservationtemporal()
    {
        $url = $this->url("/reservationtemporal/".$this->session());

        $http = HttpRequestHelper::make("GET", $url)
            ->setHeader($this->AppID())
            ->send();

        return $this->apiResponse($http);
    }

    public function ShowDaysdisabled(Request $request, $site)
    {
        $url = $this->url("/availability/daysdisabled");
        $data = $request->all();
        
        $http = HttpRequestHelper::make("GET", $url, $data)
            ->setHeader($this->AppID())
            ->send();

        return $this->apiResponse($http);
    }

    public function url(String $path)
    {
        return $this->_domain."/".request()->route("site").$path;
    }

    public function AppID(Bool $idOnly = false)
    {
        $this->site = $this->site ? $this->site : TempMicrosite::find(request()->route("site"));
        if ($this->site) {
            if ($idOnly) {
                return $this->site->app_id;
            } else {
                return array("appid" => $this->site->app_id);
            }
        } else {
            return [];
        }

    }

    public function apiResponse(HttpRequestHelper $http)
    {
        if (!$http->isOk()) {
            return response( $http->getErrorResponse(), $http->getStatusCode());
        } else {
            return response( $http->getArrayResponse(), $http->getStatusCode());
        }
    }

    public function session()
    {
        return request()->session()->get("_token");
    }
}