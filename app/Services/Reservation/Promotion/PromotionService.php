<?php

namespace App\Services\Reservation\Promotion;

use App\Services\Helpers\ApiRequestsHelper;
use App\Services\Helpers\ManageFilesHelper;
use App\Services\ImageService;

class PromotionService
{
    private $API_PROMO_URL;
    public function __construct(){
        $this->API_PROMO_URL = config("settings.API_PROMO_URL");
    }

    public function GetPromotion(int $promotion_id)
    {
        $url = $this->API_PROMO_URL . '/es/microsites/1/promotions/' . $promotion_id;
        return ApiRequestsHelper::SendRequest('GET', $url);
    }

    public function GetPromotions()
    {
        $url = $this->API_PROMO_URL . '/es/microsites/1/promotions?status=1,0';
        return ApiRequestsHelper::SendRequest('GET', $url);
    }

    public function SavePromotion($data, int $user_id)
    {
        //construir el array de redimensiones
        $dimensionsImg = ManageFilesHelper::GetDimensionsPromotionImg();

        //crear instancia de image service
        $imageService = new ImageService();
        try {
            $imageService->ResizeImage(@$data['image_fullname'], @$data['image'], 'promotions', $dimensionsImg, @$data['cropper']['areaCoords'], @$data['cropper']['canvasWidth']);
            $data['user_id'] = '1';
            $url = $this->API_PROMO_URL . '/es/microsites/1/promotions';
            //Se envía la solicitud al api
            $response = ApiRequestsHelper::SendRequest('POST', $url, null, $data);

            if ($response['success']) {
                //Se borran las imagenes de las carpetas temporales
                $imageService->RemoveImage($data['image_fullname']);
            } else {
                //Se borran las imagenes de las carpetas de redimension.
                ManageFilesHelper::RemoveImagesFromDimensions($imageService, 'promotions', $dimensionsImg, $data['image']);
            }
            return $response;
        } catch (NotReadableException $e) {
            abort(400, trans('messages.image_not_readable'));
        } catch (\Exception $e) {
        	//var_dump($e->getMessage());exit;
            abort(500, trans('error.500'));
        }
    }

    public function UpdatePromotion($data, $micro_id, $promotion_id, int $user_id)
    {
        //construir el array de redimensiones
        $dimensionsImg = ManageFilesHelper::GetDimensionsPromotionImg();

        //crear instancia de image service
        $imageService = new ImageService();
        $resp = $this->GetPromotion($promotion_id);        

        $promotion = $resp['data'];
        try {
            if ($data['image'] == $promotion['image']) {
                $imgFullname = '/files/promotions/image/800x800/' . @$data['image'];
                $imageService->ResizeImage($imgFullname, @$data['image'], 'promotions', $dimensionsImg, @$data['cropper']['areaCoords'], @$data['cropper']['canvasWidth'], false);
            } else {
                $imageService->ResizeImage(@$data['image_fullname'], @$data['image'], 'promotions', $dimensionsImg, @$data['cropper']['areaCoords'], @$data['cropper']['canvasWidth']);
            }

            //$data['user_id'] = $user_id;
            $data['user_id'] = '1';
            $url = $this->API_PROMO_URL . '/es/microsites/1/promotions/' . $promotion_id;
            //Se envía la solicitud al api
            //echo $promotion_id;
            //die();
            $response = ApiRequestsHelper::SendRequest('PUT', $url, null, $data);
            dd($response);
            //exit();

            if ($response['success']) {
                //Se borran las imagenes de las carpetas temporales
                if (isset($data['image_fullname'])) {
                    $imageService->RemoveImage($data['image_fullname']);
                }
            } else {
                //Se borran las imagenes de las carpetas de redimension.
                ManageFilesHelper::RemoveImagesFromDimensions($imageService, 'promotions', $dimensionsImg, $data['image'], false);
            }
            return $response;
        } catch (NotReadableException $e) {
            abort(400, trans('messages.image_not_readable'));
        } catch (\Exception $e) {
            abort(500, $e->getMessage() . " - " . $e->getFile() . " - " . $e->getLine());
            abort(500, trans('error.500'));
        }
    }
   

}