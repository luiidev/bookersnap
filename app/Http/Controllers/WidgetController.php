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

    public function confirm(Request $request, $site, $date, $hour, $num)
    {
        $rules = [
            "date"  => "required|date",
            "hour" => "required|numeric|digits:4|hour",
            "num"   => "required|integer|between:1,20"
        ];

        $validate = [
            "date"  => $date,
            "hour" => $hour,
            "num"   => $num
        ];

        $validator =  Validator::make($validate, $rules);

        if ($validator->fails()) {
            return response("Pagina no encontrada", 404);
        }

        $params = [
            "date" => "2016-11-29",
            "hour" => "02:00:00",
            "num_guests" => "20",
            "next_day" => "1",
            "zone_id" => "1",
            "token" => "123456789"
        ];

        $url = "http://localhost:3004/v1/es/microsites/1/reservationtemporal?date=2016-11-29&hour=19:00:00&num_guests=2&next_day=0&token=123456789&zone_id=1";

        $response = ApiRequestsHelper::SendRequest("POST", $url, []);

        return $response;

        return view("widget.paso_2");
    }
}
