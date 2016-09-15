<?php
namespace App\Http\Controllers\Admin\Reservation\Floor;
use App\Http\Controllers\Controller as Controller;
use App\Http\Requests;

//use App\Services\Reservation\Floor\FloorService;

class FloorController extends Controller
{

  public function getReservas(){
      return response()->json(
         array (
            'success' => true,
            'statuscode' => 201,
            'msg' => 'messages.turn_restriction_list',
            'data' => 
            array (
                0 => 
                  array (
                    "res_block_id"=> 11,
                    "res_table_id"=> 1,
                    "res_reservation_id"=> null,
                    "num_people"=> null,
                    "start_time"=> "8:00:00",
                    "end_time"=> "9:00:00",
                    "first_name"=> null,
                    "last_name"=> null
                  ),
                1 => 
                  array (
                    "res_block_id"=> 1,
                    "res_table_id"=> 2,
                    "res_reservation_id"=> null,
                    "num_people"=> null,
                    "start_time"=> "7:00:00",
                    "end_time"=> "10:00:00",
                    "first_name"=> null,
                    "last_name"=> null
                  ),
                2 => 
                  array (
                  "res_block_id"=> null,
                  "res_table_id"=> 3,
                  "res_reservation_id"=> 1,
                  "num_people"=> 4,
                  "start_time"=> "11:00:00",
                  "end_time"=> "12:00:00", 
                  "first_name"=> "Scarlett",
                  "last_name"=> "Johansson" 
                  ),
                3 => 
                  array (
                  "res_block_id"=> null,
                  "res_table_id"=> 3,
                  "res_reservation_id"=> 2,
                  "num_people"=> 2,
                  "start_time"=> "3:00:00",
                  "end_time"=> "5:00:00",
                  "first_name"=> "Norman",
                  "last_name"=> "Osborn"  
                  ),
                4 => 
                  array (
                    "res_block_id"=> 12,
                    "res_table_id"=> 3,
                    "res_reservation_id"=> null,
                    "num_people"=> null,
                    "start_time"=> "8:00:00",
                    "end_time"=> "9:00:00",
                    "first_name"=> null,
                    "last_name"=> null
                  ),
            ),
            'redirect' => false,
            'url' => NULL,
            'error' => 
            array (
               'user_msg' => NULL,
               'internal_msg' => NULL,
               'errors' => NULL,
            )
         )
      );
  }

}

  