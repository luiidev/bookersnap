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
