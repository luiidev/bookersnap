<?php

namespace App\Http\Controllers\Admin\Reservation\Promotion;
use App\Http\Controllers\Controller as Controller;
use Illuminate\Http\Request;
use Input;

class PromotionController extends Controller
{
   public function index(){
    return "ok";
   }

   public function uploadFile(Request $request){
      //return "ok";
      //$file = Input::file('myImage');
      //echo "file: ".$file;
      //$file = \Input::file('myImage');
      //return $file;
      //$model_class_path = $this->getClassName($request);
      //return $model_class_path;
      //return $request->all();
      //$imagen=$request->input('myImage');
      //$image = Input::file('myImage');
      $destinationPath = storage_path() . '/uploads';
      return $destinationPath;
      
   }

 
}
