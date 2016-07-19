<?php

namespace App\Http\Controllers\Admin\Zone;
use App\Http\Controllers\Controller as Controller;

class ZoneController extends Controller
{
   public function index(){
      return response()->json(
         array(
           'zones' => array(
             array(
               'zone_id' => 1,
               'zone_name' => 'vip',
               'zone_price' => 0,
               'zone_status' => true,
               'tables' => array(
                 array(
                   'table_id' => 1,
                   'table_name' => 'mesa 1',
                   'table_size' => 3,
                   'table_rotate' => 1),
                 array(
                   'table_id' => 2,
                   'table_name' => 'mesa 2',
                   'table_size' => 2,
                   'table_rotate' => 2))),
             array(
               'zone_id' => 2,
               'zone_name' => 'supervip',
               'zone_price' => 0,
               'zone_status' => true,
               'tables' => array(
                 array(
                   'table_id' => 1,
                   'table_name' => 'mesa 1',
                   'table_size' => 3,
                   'table_rotate' => 1),
                 array(
                   'table_id' => 2,
                   'table_name' => 'mesa 2',
                   'table_size' => 2,
                   'table_rotate' => 2)
                 ))
             )));
   }

   public function getZone($lang,$id){
   	return $id;
   }

   public function createZone($lang){
   	return "data";
   }
   public function updateZone($lang,$id){
   	return "data";
   }
   public function deleteZone($lang,$id){
   	return "data";
   }
  
}
