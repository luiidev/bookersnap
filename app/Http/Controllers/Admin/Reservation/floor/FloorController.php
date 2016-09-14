<?php

namespace App\Http\Controllers\Admin\Reservation\Floor;
use App\Http\Controllers\Controller as Controller;
use Illuminate\Http\Request;
use App\Http\Requests;

//use App\Services\Reservation\Floor\FloorService;

class FloorController extends Controller
{
  /*protected $_floorService;
  public function __construct(FloorService $floor){
    $this->_floorService = $floor;
  }
  */
  public function index()
  {
      //$response = $this->_floorService->GetPromotions();
      //return response()->json($response, $response['statuscode']);
  }
   
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
                  "res_block_id": 11,
                  "res_table_id": 1,
                  "res_reservation_id": null,
                  "num_people": 1,
                  "start_time": "7:00:00",
                  "end_time": "10:00:00",
                  ),
               1 => 
                  array (
                  "res_block_id": 1,
                  "res_table_id": 2,
                  "res_reservation_id": null,
                  "num_people": 1,
                  "start_time": "7:00:00",
                  "end_time": "10:00:00", 
                  ),
               2 => 
                  array (
                  "res_block_id": null,
                  "res_table_id": 1,
                  "res_reservation_id": 1,
                  "num_people": 1,
                  "start_time": "11:00:00",
                  "end_time": "12:00:00",  
                  ),
               3 => 
                  array (
                  'label_id' => 4,
                  'name' => 'Hora_de_reservacion.',
                  )
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

  