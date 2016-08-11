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
            'success' => true,
            'statuscode' => 201,
            'msg' => 'messages.turn_restriction_list',
            'data' => 
            array (
               0 => 
                  array (
                  'label_id' => 1,
                  'name' => 'Nombre'
                  ),
               1 => 
                  array (
                  'label_id' => 2,
                  'name' => 'Apellido',
                  ),
               2 => 
                  array (
                  'label_id' => 3,
                  'name' => 'Fecha_de_reservacion',
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

   public function getTypographys(){
      return response()->json(
         array (
            'success' => true,
            'statuscode' => 201,
            'msg' => 'messages.turn_restriction_list',
            'data' => 
            array (
               0 => 
                  array (
                  'typography_id' => 1,
                  'name' => 'Arial'
                  ),
               1 => 
                  array (
                  'typography_id' => 2,
                  'name' => 'Lobster'
                  ),
               2 => 
                  array (
                  'typography_id' => 3,
                  'name' => 'Roboto',
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


   public function getTypes(){
      return response()->json(
         array (
            'success' => true,
            'statuscode' => 201,
            'msg' => 'messages.turn_restriction_list',
            'data' => 
            array (
               0 => 
                  array (
                  'type_event_id' => 3,
                  'name' => 'Promoción gratis',
                  ),
               1 => 
                  array (
                  'type_event_id' => 4,
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
            )
         )
      );
   }


   public function uploadFile64(Request $request){

      $data = $_POST['file'];
      list($type, $data) = explode(';', $data);
      list(, $data)      = explode(',', $data);
      $data = base64_decode($data);
      $urlimage=$_SERVER['DOCUMENT_ROOT'] . "/files/flyer/image/".time().'.png';

      file_put_contents($urlimage, $data);
      return $urlimage;
      
   }
   public function uploadFile(Request $request){

      if ($request->file('file')->isValid()) { 
         $request->file('file')->move("files/flyer/image/","flyer.jpg");
      }

   }

 
}
