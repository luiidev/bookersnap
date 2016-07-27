<?php

namespace App\Http\Controllers\Admin\Tables\Turn;
use App\Http\Controllers\Controller as Controller;

class TurnController extends Controller
{
   public function index(){
      return response()->json(
      array (
         0 => array (
         'id' => 1,
         'name' => 'Turno 01',
         'hours_ini' => '17:26:02',
         'hours_end' => '17:26:02',
         'hours_ini_web' => '17:26:02',
         'hours_end_web' => '17:26:02',
         'days'=>array(0 => array ('id' => 1,'name' => 'Lunes'), 1 => array ('id' => 2,'name' => 'Martes')) 
         ),
         1 => array (
         'id' => 2,
         'name' => 'Turno 02',
         'hours_ini' => '17:26:02',
         'hours_end' => '17:26:02',
         'hours_ini_web' => '17:26:02',
         'hours_end_web' => '17:26:02',
         'days'=>array(0 => array ('id' => 1,'name' => 'Lunes'), 1 => array ('id' => 2,'name' => 'Martes')) 
         ),
         2 => array (
         'id' => 3,
         'name' => 'Turno 03',
         'hours_ini' => '17:26:02',
         'hours_end' => '17:26:02',
         'hours_ini_web' => '2016-07-19 17:26:02',
         'hours_end_web' => '2016-07-19 17:26:02',
         'days'=>array(0 => array ('id' => 1,'name' => 'Lunes'), 1 => array ('id' => 2,'name' => 'Martes')) 
         )
      )
      );
   }

   public function get($lang,$id){
   	return $id;
   }

   public function create($lang){
   	return "data";
   }
   public function update($lang,$id){
   	return "data";
   }
   public function delete($lang,$id){
   	return "data";
   }
  
}
