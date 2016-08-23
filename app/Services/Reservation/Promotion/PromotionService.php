<?php

namespace App\Services\Reservation\Promotion;

use App\Services\Helpers\ApiRequestsHelper;
use App\Services\Helpers\ManageFilesHelper;
use App\Services\ImageService;

class PromotionService
{

    public function GetPromotion(int $id)
    {
        $url = API_ADMIN_URL . '/es/category/' . $id;
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
            $data['user_id'] = $user_id;
            $url = API_ADMIN_URL . '/es/category';
            //Se envía la solicitud al api
            $response = ApiRequestsHelper::SendRequest('POST', $url, null, $data);
            if ($response['success']) {
                //Se borran las imagenes de las carpetas temporales
                $imageService->RemoveImage($data['image_logo_fullname']);
                $imageService->RemoveImage($data['image_favicon_fullname']);
            } else {
                //Se borran las imagenes de las carpetas de redimension.
                ManageFilesHelper::RemoveImagesFromDimensions($imageService, 'promotions', $dimensionsImg, $data['image']);
            }
            return $response;
        } catch (NotReadableException $e) {
            abort(400, trans('messages.image_not_readable'));
        } catch (\Exception $e) {
            abort(500, trans('error.500'));
        }
    }

   

}