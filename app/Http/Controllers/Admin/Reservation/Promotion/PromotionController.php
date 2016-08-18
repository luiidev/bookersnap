<?php

namespace App\Http\Controllers\Admin\Reservation\Promotion;
use App\Http\Controllers\Controller as Controller;
use Illuminate\Http\Request;

class PromotionController extends Controller
{
   public function index(){
    return "ok";
   }
   
   public function getPromotion(){
      return response()->json(
         array (
            'success' => true,
            'statuscode' => 201,
            'msg' => 'messages.turn_restriction_list',
            'data' =>
            array (
               'microsite_id' => 1,
               'event_id' => 1,
               'token' => 'abc123456',
               'type_event' => 3,
               'titulo' => 'Titulo de promocion',
               'description' => '<p>Resultados de programacion de una promocion</p>',
               'status_expire' => 0,
               'date_expire ' => '',
               'publication' => 1,
               'status' => 1,
               'image' => 'myavatar.png',
               'turn' => 
                  array (
                     0 => 
                     array (
                        'dias' => 
                        array (
                           0 => 
                           array (
                              'day' => 0,
                           ),
                           1 => 
                           array (
                              'day' => 1,
                           ),
                        ),
                        'hinicio' => '03:02:00',
                        'hfinal' => '05:02:00',
                     ),
                  ),
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

   public function getZones(){
      return response()->json(
         array (
          'success' => true,
          'statuscode' => 201,
          'msg' => 'messages.table_pay_list',
          'data' => 
          array (
           'zone' => 
           array (
            'zone_id' => 23,
            'name' => 'Zona 01',
            'table' => 
            array (
             0 => 
             array (
              'table_id' => 1,
              'name' => 'MESA DE COMPAÑIA 2',
              'min_cover' => 5,
              'max_cover' => NULL,
              'config_color' => NULL,
              'config_position' => '20,20',
              'config_forme' =>3,
              'config_size' => 2,
              'config_rotation' => 45,
              'price' => '',
              ),
             1 => 
             array (
              'table_id' => 2,
              'name' => 'MESA DE COMPAÑIA ALTERNA',
              'min_cover' => 5,
              'max_cover' => NULL,
              'config_color' => NULL,
              'config_position' => '130,20',
              'config_forme' => 1,
              'config_size' => 2,
              'config_rotation' => 0,
              'price' => '',
              ),
             2 => 
             array (
              'table_id' => 3,
              'name' => 'Obed Trejo',
              'min_cover' => 5,
              'max_cover' => NULL,
              'config_color' => NULL,
              'config_position' => '230,20',
              'config_forme' => 1,
              'config_size' => 1,
              'config_rotation' => 0,
              'price' => '52.368',
              ),
             3 => 
             array (
              'table_id' => 4,
              'name' => 'MESA DE COMPAÑIA ALTERNA',
              'min_cover' => 5,
              'max_cover' => NULL,
              'config_color' => NULL,
              'config_position' => '60,120',
              'config_forme' => 2,
              'config_size' => 2,
              'config_rotation' => 0,
              'price' => '',
              ),
             ),
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
