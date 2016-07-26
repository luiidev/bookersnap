<?php

namespace App\Http\Controllers\Admin\Tables\Zone;
use App\Http\Controllers\Controller as Controller;
use Illuminate\Http\Request;

class ZoneController extends Controller
{
   public function index(){
    return response()->json(
     array (
      0 => 
      array (
        'id' => 1,
        'created_at' => '2016-07-19 16:42:45',
        'updated_at' => '2016-07-19 16:42:45',
        'name' => 'zona10',
        'sketch' => 'asdas322fsd',
        'status' => 1,
        'type_zone' => 1,
        'join_table' => 1,
        'status_smoker' => 0,
        'people_standing' => 0,
        'user_add' => 1,
        'user_upd' => 2,
        'ev_event_id' => 11,
        'ms_microsite_id' => 1,
        'tables' => 
        array (
          0 => 
          array (
            'id' => 1,
            'created_at' => '2016-07-19 17:26:02',
            'updated_at' => '2016-07-19 17:26:02',
            'res_zone_id' => 1,
            'name' => '',
            'min_cover' => 1,
            'max_cover' => 0,
            'price' => 0,
            'status' => 1,
            'config_color' => '',
            'config_position' => '12,20',
            'config_forme' => 0,
            'config_size' => 0,
            'config_rotation' => 0,
            'config_rotation_name'=>0,
            'date_add' => '0000-00-00 00:00:00',
            'date_upd' => '0000-00-00 00:00:00',
            'user_add' => 0,
            'user_upd' => 0,
            ),
          2 => 
          array (
            'id' => 3,
            'created_at' => '2016-07-19 17:26:16',
            'updated_at' => '2016-07-19 17:26:16',
            'res_zone_id' => 1,
            'name' => '',
            'min_cover' => 1,
            'max_cover' => 0,
            'price' => 0,
            'status' => 1,
            'config_color' => '',
            'config_position' => '',
            'config_forme' => 0,
            'config_size' => 0,
            'config_rotation' => 0,
            'date_add' => '0000-00-00 00:00:00',
            'date_upd' => '0000-00-00 00:00:00',
            'user_add' => 0,
            'user_upd' => 0,
            ),
          3 => 
          array (
            'id' => 4,
            'created_at' => '2016-07-19 18:21:21',
            'updated_at' => '2016-07-19 18:21:21',
            'res_zone_id' => 1,
            'name' => 'table 4',
            'min_cover' => 5,
            'max_cover' => 0,
            'price' => 0,
            'status' => 1,
            'config_color' => '1',
            'config_position' => '1',
            'config_forme' => 1,
            'config_size' => 1,
            'config_rotation' => 45,
            'date_add' => '0000-00-00 00:00:00',
            'date_upd' => '0000-00-00 00:00:00',
            'user_add' => 1,
            'user_upd' => 1,
            ),
          ),
        ),
      1 => 
      array (
        'id' => 2,
        'created_at' => '2016-07-19 16:42:45',
        'updated_at' => '2016-07-19 16:42:45',
        'name' => 'zona11',
        'sketch' => 'asdas322fsd',
        'status' => 2,
        'type_zone' => 1,
        'join_table' => 1,
        'status_smoker' => 0,
        'people_standing' => 0,
        'user_add' => 1,
        'user_upd' => 2,
        'ev_event_id' => 11,
        'ms_microsite_id' => 1,
        'tables' => 
        array (
          0 => 
          array (
            'id' => 1,
            'created_at' => '2016-07-19 17:26:02',
            'updated_at' => '2016-07-19 17:26:02',
            'res_zone_id' => 1,
            'name' => '',
            'min_cover' => 1,
            'max_cover' => 0,
            'price' => 0,
            'status' => 1,
            'config_color' => '',
            'config_position' => '',
            'config_forme' => 0,
            'config_size' => 0,
            'config_rotation' => 0,
            'date_add' => '0000-00-00 00:00:00',
            'date_upd' => '0000-00-00 00:00:00',
            'user_add' => 0,
            'user_upd' => 0,
            ),
          2 => 
          array (
            'id' => 3,
            'created_at' => '2016-07-19 17:26:16',
            'updated_at' => '2016-07-19 17:26:16',
            'res_zone_id' => 1,
            'name' => '',
            'min_cover' => 1,
            'max_cover' => 0,
            'price' => 0,
            'status' => 1,
            'config_color' => '',
            'config_position' => '',
            'config_forme' => 0,
            'config_size' => 0,
            'config_rotation' => 0,
            'date_add' => '0000-00-00 00:00:00',
            'date_upd' => '0000-00-00 00:00:00',
            'user_add' => 0,
            'user_upd' => 0,
            ),
          3 => 
          array (
            'id' => 4,
            'created_at' => '2016-07-19 18:21:21',
            'updated_at' => '2016-07-19 18:21:21',
            'res_zone_id' => 1,
            'name' => 'table 4',
            'min_cover' => 5,
            'max_cover' => 0,
            'price' => 0,
            'status' => 1,
            'config_color' => '1',
            'config_position' => '1',
            'config_forme' => 1,
            'config_size' => 1,
            'config_rotation' => 45,
            'date_add' => '0000-00-00 00:00:00',
            'date_upd' => '0000-00-00 00:00:00',
            'user_add' => 1,
            'user_upd' => 1,
            ),
          ),
        ),
      )
      );
   }

   public function get($lang,$id){
   	return response()->json(
       array (
        'id' => 1,
        'created_at' => '2016-07-19 16:42:45',
        'updated_at' => '2016-07-19 16:42:45',
        'name' => 'zona demo',
        'sketch' => 'asdas322fsd',
        'status' => 2,
        'type_zone' => 1,
        'join_table' => 1,
        'status_smoker' => 0,
        'people_standing' => 0,
        'user_add' => 1,
        'user_upd' => 2,
        'ev_event_id' => 11,
        'ms_microsite_id' => 1,
        'tables' => 
        array (
          0 => 
          array (
            'id' => 1,
            'created_at' => '2016-07-19 17:26:02',
            'updated_at' => '2016-07-19 17:26:02',
            'res_zone_id' => 1,
            'name' => 'c1',
            'min_cover' => 1,
            'max_cover' => 1,
            'price' => 0,
            'status' => 1,
            'config_color' => '',
            'config_position' => '452,111',
            'config_forme' => 1,
            'config_size' => 1,
            'config_rotation' => 0,
            'date_add' => '0000-00-00 00:00:00',
            'date_upd' => '0000-00-00 00:00:00',
            'user_add' => 0,
            'user_upd' => 0,
            ),
          2 => 
          array (
            'id' => 3,
            'created_at' => '2016-07-19 17:26:16',
            'updated_at' => '2016-07-19 17:26:16',
            'res_zone_id' => 1,
            'name' => 'c2',
            'min_cover' => 1,
            'max_cover' => 1,
            'price' => 0,
            'status' => 1,
            'config_color' => '',
            'config_position' => '275,350',
            'config_forme' => 2,
            'config_size' => 3,
            'config_rotation' => 0,
            'date_add' => '0000-00-00 00:00:00',
            'date_upd' => '0000-00-00 00:00:00',
            'user_add' => 0,
            'user_upd' => 0,
            ),
          3 => 
          array (
            'id' => 4,
            'created_at' => '2016-07-19 18:21:21',
            'updated_at' => '2016-07-19 18:21:21',
            'res_zone_id' => 1,
            'name' => 'c3',
            'min_cover' => 1,
            'max_cover' => 1,
            'price' => 0,
            'status' => 1,
            'config_color' => '1',
            'config_position' => '402,215',
            'config_forme' => 1,
            'config_size' => 1,
            'config_rotation' => 45,
            'date_add' => '0000-00-00 00:00:00',
            'date_upd' => '0000-00-00 00:00:00',
            'user_add' => 1,
            'user_upd' => 1,
            ),
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
   
   public function delete($lang,Request $request){
   	return "data";
   }
  
}
