<?php

namespace App\Http\Controllers\Admin\Reservation\Promotion;
use App\Http\Controllers\Controller as Controller;
use Illuminate\Http\Request;
use App\Services\ImageService;
use App\Http\Requests;

use App\Services\Reservation\Promotion\PromotionService;

class PromotionController extends Controller
{
  protected $_promotionService;
  public function __construct(PromotionService $promotion){
    $this->_promotionService = $promotion;
  }
  
  public function index()
  {
      $response = $this->_promotionService->GetPromotions();
      return response()->json($response, $response['statuscode']);
  }

  public function showPromotion($lang, int $micro, int $id)
  {
    $response = $this->_promotionService->GetPromotion($id);
    return response()->json($response, $response['statuscode']);
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
               'zone'=>
                  array (
                   0 => 
                   array (
                    'zone_id' => 23,
                    'name' => 'Zona 01',
                    'table' => 
                    array (
                     0 => 
                     array (
                      'name_zona' => 'Zona 01',
                      'table_id' => 1,
                      'name' => 'MESA DE COMPAÑIA 2',
                      'minCover' => 5,
                      'maxCover' => NULL,
                      'left' => '20',
                      'top' => '20',
                      'shape' => 'recta',
                      'size' => 'medium',
                      'rotate' => 45,
                      'price' => '',
                      ),
                     1 => 
                     array (
                      'name_zona' => 'Zona 01',
                      'table_id' => 2,
                      'name' => 'MESA DE COMPAÑIA ALTERNA',
                      'minCover' => 5,
                      'maxCover' => NULL,
                      'left' => '130',
                      'top' => '20',
                      'shape' => 'round',
                      'size' => 'medium',
                      'rotate' => 0,
                      'price' => '',
                      ),
                     2 => 
                     array (
                      'name_zona' => 'Zona 01',
                      'table_id' => 3,
                      'name' => 'Obed Trejo',
                      'minCover' => 5,
                      'maxCover' => NULL,
                      'left' => '230',
                      'top' => '20',
                      'shape' => 'round',
                      'size' => 'small',
                      'rotate' => 0,
                      'price' => '52.368',
                      ),
                     3 => 
                     array (
                      'name_zona' => 'Zona 01',
                      'table_id' => 4,
                      'name' => 'MESA DE COMPAÑIA ALTERNA',
                      'minCover' => 5,
                      'maxCover' => NULL,
                      'left' => '60',
                      'top' => '120',
                      'shape' => 'square',
                      'size' => 'medium',
                      'rotate' => 0,
                      'price' => '',
                      ),
                     ),
                    ),
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
              'min_cover' => 1,
              'max_cover' => NULL,
              'config_color' => NULL,
              'config_position' => '20,20',
              'config_forme' =>3,
              'config_size' => 2,
              'config_rotation' => 0,
              'price' => '',
              ),
             1 => 
             array (
              'table_id' => 2,
              'name' => 'MESA DE COMPAÑIA ALTERNA',
              'min_cover' => 2,
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
              'min_cover' => 3,
              'max_cover' => NULL,
              'config_color' => NULL,
              'config_position' => '230,20',
              'config_forme' => 1,
              'config_size' => 1,
              'config_rotation' => 0,
              'price' => '',
              ),
             3 => 
             array (
              'table_id' => 4,
              'name' => 'MESA DE COMPAÑIA ALTERNA',
              'min_cover' => 4,
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
            array (
            'zone_id' => 24,
            'name' => 'Zona 02',
            'table' => 
            array (
             0 => 
             array (
              'table_id' => 5,
              'name' => 'MESA DE COMPAÑIA 2',
              'min_cover' => 1,
              'max_cover' => NULL,
              'config_color' => NULL,
              'config_position' => '120,20',
              'config_forme' =>3,
              'config_size' => 2,
              'config_rotation' => 0,
              'price' => '',
              ),
             1 => 
             array (
              'table_id' => 6,
              'name' => 'MESA DE COMPAÑIA 2',
              'min_cover' => 1,
              'max_cover' => NULL,
              'config_color' => NULL,
              'config_position' => '120,120',
              'config_forme' =>3,
              'config_size' => 2,
              'config_rotation' => 0,
              'price' => '',
              ),
             )
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

/*
   public function uploadFile64(Request $request){

      $data = $_POST['file'];
      list($type, $data) = explode(';', $data);
      list(, $data)      = explode(',', $data);
      $data = base64_decode($data);
      $urlimage=$_SERVER['DOCUMENT_ROOT'] . "/files/promotions/image/".time().'.png';

      file_put_contents($urlimage, $data);
      return $urlimage; 
   }
*/
   public function uploadFile(Request $request){

      //obtenemos la imagen
        $imagen = $request->file('file');

        //instanciamos el servicio de imagen
        $imgService = new ImageService();

        //construimos el array de validaciones
        $validations = [
            'mimes' => ['image/gif', 'image/jpeg', 'image/png'],
            'max-size' => 20971520
        ];
        $response = $imgService->saveImageToTemp($imagen, $validations);

        return response()->json($response);

   }


  
  public function storePromotion(Request $request)
  {
      $user_id = 1;
      $response = $this->_promotionService->SavePromotion($request->all(), $user_id);
      return response()->json($response, $response['statuscode']);
  }

  public function updatePromotion($lang, $id, Request $request)
  {
      //$user_id = $this->GetUserId();
      $user_id = 1;
      $response = $this->_promotionService->UpdatePromotion($request->all(), $id, $user_id);
      return response()->json($response, $response['statuscode']);
  }

 
}
