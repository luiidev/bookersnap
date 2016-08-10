<?php

namespace App\Http\Controllers\Admin\Tables\Zone;

use App\Http\Controllers\Controller as Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Services\Tables\ZoneService;

class ZoneController extends Controller
{
  protected $_zoneService;

  public function __construct(ZoneService $zoneService){
    $this->_zoneService = $zoneService;
  }
  
  public function index($lang,int $micro){
    
    $url = API_MESAS_URL ."/v1/".$lang."/microsites/".$micro."/zoness";
       
    $responses = $this->_zoneService->getAll($url);

    return $responses;
     
  }

  public function get($lang,$id){

   	return response()->json(
        array (
          'success' => true,
          'statuscode' => 201,
          'msg' => 'messages.event_list',
          'data' => 
          array (
            0 => 
            array (
              'name' => 'zona demo',
              'ms_microsite_id' => '12',
              'tables' => 
              array (
                0 => 
                array (
                  'name' => 'c1',
                  'min_cover' => 1,
                  'max_cover' => 1,
                  'config_position' => '452,111',
                  'config_size' => 1,
                  'config_rotation' => 0,
                  'config_forme' => 1,
                  ),
                1 => 
                array (
                  'name' => 'c2',
                  'min_cover' => 1,
                  'max_cover' => 17,
                  'config_position' => '276,350',
                  'config_size' => 3,
                  'config_rotation' => 0,
                  'config_forme' => 2,
                  ),
                2 => 
                array (
                  'name' => 'c3',
                  'min_cover' => 1,
                  'max_cover' => 1,
                  'config_position' => '402,215',
                  'config_size' => 1,
                  'config_rotation' => 45,
                  'config_forme' => 1,
                  ),
                ),
              'id' => '2',
              ),
            ),
          'redirect' => false,
          'url' => NULL,
          'error' => 
          array (
            'user_msg' => NULL,
            'internal_msg' => NULL,
            'errors' => NULL,
            ),
        )
       );
  }

  public function create($lang,Request $request){
   	return "ok create";
  }

  public function update($lang,Request $request){
   	return "ok update";
  }
   
  public function delete($lang,$id){
   	return "ok delete";
  }
  
}
