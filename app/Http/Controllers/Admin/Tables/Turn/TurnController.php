<?php

namespace App\Http\Controllers\Admin\Tables\Turn;
use App\Http\Controllers\Controller as Controller;

class TurnController extends Controller
{
   public function index(){
    return response()->json();
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
