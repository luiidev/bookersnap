<?php

namespace App\Http\Controllers\Admin\Tables\Turn;
use App\Http\Controllers\Controller as Controller;
use Illuminate\Http\Request;
use Curl;

class TurnController extends Controller
{
   public function index(){
      return response()->json(
         array (
          0 => 
          array (
           'id' => 2,
           'hours_ini' => '07:00:00',
           'hours_end' => '11:00:00',
           'status' => 1,
           'on_table' => 0,
           'early' => 0,
           'days' => '',
           'type' => 
           array (
            'id' => 2,
            'name' => 'Almuerzo',
            'status' => 0,
            ),
           ),
          1 => 
          array (
           'id' => 1,
           'hours_ini' => '07:00:00',
           'hours_end' => '11:00:00',
           'status' => 1,
           'on_table' => 0,
           'early' => 0,
           'days' => 
           array (
            0 => 
            array (
             'day' => 1,
             ),
            1 => 
            array (
             'day' => 2,
             ),
            2 => 
            array (
             'day' => 3,
             ),
            3 => 
            array (
             'day' => 4,
             ),
            4 => 
            array (
             'day' => 5,
             ),
            ),
           'type' => 
           array (
            'id' => 1,
            'name' => 'Desayuno',
            'status' => 1,
            ),
           ),
          )
      );
   }

   public function get($lang,$id){
      /*$curlService = new \Ixudra\Curl\CurlService();
      $responses = $curlService->to('http://jsonplaceholder.typicode.com/posts')->asJson()->get();*/

   	return response()->json(
      array (
        'name' => 'almuerzo 1',
        'hours_ini' => '07:00:00',
        'hours_end' => '11:00:00',
        'status' => 1,
        'on_table' => 0,
        'early' => 0,
        'days' => 
        array (
          0 => 
          array (
            'day' => 1,
            ),
          1 => 
          array (
            'day' => 2,
            ),
          2 => 
          array (
            'day' => 3,
            )
          ),
        'type' => 
           array (
            'id' => 2,
            'name' => 'Almuerzo',
            'status' => 0,
            ),
        ));
   }

   public function create($lang,Request $request){
   	return $request->input();
   }
   public function update($lang,Request $request){
   	return $request->input();
   }
   public function delete($lang,$id){
   	return "data";
   }
  
}
