<?php
/**
 * Created by PhpStorm.
 * User: BS
 * Date: 08/08/2016
 * Time: 15:17
 */

namespace App\Services;


use App\Services\Helpers\ApiRequestsHelper;
use App\Services\Helpers\ManageFilesHelper;
use Config;
use Illuminate\Http\UploadedFile;
use Intervention\Image\Exception\NotReadableException;
use Session;

class AjaxService
{

    private $_token;

    public function __construct()
    {
        $this->_token = Session::get('api-token');
        $this->_token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MjEsIm5hbWUiOm51bGwsImF1ZCI6IjJjMzRkOTExZjc2ZGNlNmQ3MmMxYzljNmE5NzA5MmExNTQzMWZkNjMiLCJpc3MiOiJodHRwOlwvXC9sb2NhbGhvc3Q6MzAwMVwvdjFcL2VzXC9hdXRoXC9zb2NpYWxuZXR3b3JrIiwiaWF0IjoxNDcwNzgzNzc4LCJleHAiOjE0NzA3OTA5NzgsIm5iZiI6MTQ3MDc4Mzc3OCwianRpIjoiNTdhNzJiMDM2Y2NiNjk0ZWE4YTMzMmMzYzM1MzBlZjIifQ.Fzz1cJJCDMY0ey2Pot-OoV7eNDjgpCgBRb4bLZBj_aY';
    }


    public function GetTestData()
    {
        //$url = Config::get("constants.url.api.admin");
        $url = API_ADMIN_URL . '/es/microsite/sitename';
        $credentials = [
            'Authorization' => 'Bearer ' . $this->_token,
            'type-admin' => 1
        ];
        $data = [
            'sitename' => 'don-titos',
            'free' => false
        ];
        return ApiRequestsHelper::SendRequest('POST', $url, $credentials, $data);
    }

    public function SaveCategory(array $data, int $id_user)
    {
        //construir el array de redimensiones
        $dimensionsLogo = ManageFilesHelper::GetDimensionsCategoryLogo();
        $dimensionsFavicon = ManageFilesHelper::GetDimensionsCategoryFavicon();

        //crear instancia de image service
        $imageService = new ImageService();
        try {
            $imageService->ResizeImage(@$data['image_logo_fullname'], @$data['image_logo'], 'categories', $dimensionsLogo);
            $imageService->ResizeImage(@$data['image_favicon_fullname'], @$data['image_favicon'], 'categories', $dimensionsFavicon);
            $data['user_id'] = $id_user;
            $url = API_ADMIN_URL . '/es/category';
            $response = ApiRequestsHelper::SendRequest('POST', $url, [], $data);
            if ($response['success']) {
                $imageService->RemoveImage($data['image_logo_fullname']);
                $imageService->RemoveImage($data['image_favicon_fullname']);
            } else {
                ManageFilesHelper::RemoveImagesFromDimensions($imageService, 'categories', $dimensionsLogo, $data['image_logo']);
                ManageFilesHelper::RemoveImagesFromDimensions($imageService, 'categories', $dimensionsFavicon, $data['image_favicon']);
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