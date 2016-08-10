<?php

namespace App\Http\Controllers\Admin\Reservation\Promotion;
use App\Http\Controllers\Controller as Controller;
use Illuminate\Http\Request;

class PromotionController extends Controller
{
   public function index(){
    return "ok";
   }
   
   public function getLabel(){
      return response()->json(
         array (
          0 => 
          array (
           'id' => 1,
           'name' => 'Jose'
          ),
          1 => 
          array (
           'id' => 2,
           'name' => 'Martinez'
          ),
          2 => 
          array (
           'id' => 3,
           'name' => '10/08/2016'
          ),
          3 => 
          array (
           'id' => 4,
           'name' => '05:20p.m.'
           )
         )
      );
   }

   public function getTypesPromotion(){
      return response()->json(
         array (
            'success' => true,
            'statuscode' => 201,
            'msg' => 'messages.turn_restriction_list',
            'data' => 
            array (
               0 => 
                  array (
                  'id' => 1,
                  'name' => 'Evento gratuito'
                  ),
               1 => 
                  array (
                  'id' => 2,
                  'name' => 'Evento de paga',
                  ),
               2 => 
                  array (
                  'id' => 3,
                  'name' => 'Promoción gratis',
                  ),
               3 => 
                  array (
                  'id' => 4,
                  'name' => 'Promoción de paga',
                  )
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


   public function uploadFile64(Request $request){

      $data = $_POST['file'];
      list($type, $data) = explode(';', $data);
      list(, $data)      = explode(',', $data);
      $data = base64_decode($data);
      $urlimage=$_SERVER['DOCUMENT_ROOT'] . "/file/img/flyer/".time().'.png';

      file_put_contents($urlimage, $data);
      return $urlimage;
      
   }
   public function uploadFile(Request $request){

      if ($request->file('file')->isValid()) { 
         $request->file('file')->move("file/img/flyer","flyer.jpg");
      }

   }

 
}
