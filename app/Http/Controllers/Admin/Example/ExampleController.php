<?php

namespace App\Http\Controllers\Admin\Example;
use App\Http\Controllers\Controller as Controller;

class ExampleController extends Controller
{
   public function index(){
   	return "data";
   }

   public function getExample($lang,$id){
   	return "data";
   }

   public function createExample($lang){
   	return "ds";
   }
   public function updateExample($lang,$id){
   	return "data";
   }
   public function deleteExample($lang,$id){
   	return "data";
   }
  
}
