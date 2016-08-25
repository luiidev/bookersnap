<?php
/**
 * Created by PhpStorm.
 * User: BS
 * Date: 12/08/2016
 * Time: 16:42
 */

namespace App\Services\Master;

use App\Services\Helpers\ApiRequestsHelper;
use App\Services\Helpers\ManageFilesHelper;
use App\Services\ImageService;
use Intervention\Image\Exception\NotReadableException;

class CategoryService
{

    private $_api_admin_url;

    public function __construct()
    {
        $this->_api_admin_url = config('settings.API_ADMIN_URL');
    }

    public function GetCategory(int $id)
    {
        $url = $this->_api_admin_url . '/es/category/' . $id;
        return ApiRequestsHelper::SendRequest('GET', $url);
    }

    public function GetCategories()
    {
        $url = $this->_api_admin_url . '/es/category?status=1,0';
        return ApiRequestsHelper::SendRequest('GET', $url);
    }

    public function SaveCategory($data, int $user_id, array $credentials)
    {
        //construir el array de redimensiones
        $dimensionsLogo = ManageFilesHelper::GetDimensionsCategoryLogo();
        $dimensionsFavicon = ManageFilesHelper::GetDimensionsCategoryFavicon();
        //crear instancia de image service
        $imageService = new ImageService();
        try {
            $imageService->ResizeImage(@$data['image_logo_fullname'], @$data['image_logo'], 'categories', $dimensionsLogo, @$data['croppedLogo'], @$data['dimensions_logo']['canvasWidth']);
            $imageService->ResizeImage(@$data['image_favicon_fullname'], @$data['image_favicon'], 'categories', $dimensionsFavicon, @$data['croppedFavicon'], @$data['dimensions_favicon']['canvasWidth']);
            $data['user_id'] = $user_id;
            $url = $this->_api_admin_url . '/es/category';
            //Se envía la solicitud al api
            $response = ApiRequestsHelper::SendRequest('POST', $url, $credentials, $data);
            if ($response['success']) {
                //Se borran las imagenes de las carpetas temporales
                $imageService->RemoveImage($data['image_logo_fullname']);
                $imageService->RemoveImage($data['image_favicon_fullname']);
            } else {
                //Se borran las imagenes de las carpetas de redimension.
                ManageFilesHelper::RemoveImagesFromDimensions($imageService, 'categories', $dimensionsLogo, $data['image_logo']);
                ManageFilesHelper::RemoveImagesFromDimensions($imageService, 'categories', $dimensionsFavicon, $data['image_favicon']);
            }
            return $response;
        } catch (NotReadableException $e) {
            abort(400, trans('messages.image_not_readable'));
        } catch (\Exception $e) {
            abort(500, trans('error.500'));
        }
    }

    public function UpdateCategory($data, $id, int $user_id, array $credentials)
    {
        //construir el array de redimensiones
        $dimensionsLogo = ManageFilesHelper::GetDimensionsCategoryLogo();
        $dimensionsFavicon = ManageFilesHelper::GetDimensionsCategoryFavicon();
        //crear instancia de image service
        $imageService = new ImageService();
        $resp = $this->GetCategory($id);
        $category = $resp['data'];
        try {
            if ($data['image_logo'] == $category['image_logo']) {
                $logoFullname = '/files/categories/image/800x800/' . @$data['image_logo'];
                $imageService->ResizeImage($logoFullname, @$data['image_logo'], 'categories', $dimensionsLogo, @$data['croppedLogo'], @$data['dimensions_logo']['canvasWidth'], false);
            } else {
                $imageService->ResizeImage(@$data['image_logo_fullname'], @$data['image_logo'], 'categories', $dimensionsLogo, @$data['croppedLogo'], @$data['dimensions_logo']['canvasWidth']);
            }

            if ($data['image_favicon'] == $category['image_favicon']) {
                $logoFullname = '/files/categories/image/800x800/' . @$data['image_favicon'];
                $imageService->ResizeImage($logoFullname, @$data['image_favicon'], 'categories', $dimensionsFavicon, @$data['croppedFavicon'], @$data['dimensions_favicon']['canvasWidth'], false);
            } else {
                $imageService->ResizeImage(@$data['image_favicon_fullname'], @$data['image_favicon'], 'categories', $dimensionsFavicon, @$data['croppedFavicon'], @$data['dimensions_favicon']['canvasWidth']);
            }

            $data['user_id'] = $user_id;
            $url = $this->_api_admin_url . '/es/category/' . $id;
            //Se envía la solicitud al api
            $response = ApiRequestsHelper::SendRequest('PUT', $url, $credentials, $data);
            if ($response['success']) {
                //Se borran las imagenes de las carpetas temporales
                if (isset($data['image_logo_fullname'])) {
                    $imageService->RemoveImage($data['image_logo_fullname']);
                }

                if (isset($data['image_favicon_fullname'])) {
                    $imageService->RemoveImage($data['image_favicon_fullname']);
                }
            } else {
                //Se borran las imagenes de las carpetas de redimension.
                ManageFilesHelper::RemoveImagesFromDimensions($imageService, 'categories', $dimensionsLogo, $data['image_logo'], false);
                ManageFilesHelper::RemoveImagesFromDimensions($imageService, 'categories', $dimensionsFavicon, $data['image_favicon'], false);
            }
            return $response;
        } catch (NotReadableException $e) {
            abort(400, trans('messages.image_not_readable'));
        } catch (\Exception $e) {
            abort(500, $e->getMessage() . " - " . $e->getFile() . " - " . $e->getLine());
            abort(500, trans('error.500'));
        }
    }

    public function DeleteCategory($id, array $credentials)
    {
        $url = $this->_api_admin_url . '/es/category/' . $id . '?field=status';
        $data = [
            'status' => 2
        ];
        return ApiRequestsHelper::SendRequest('PUT', $url, $credentials, $data);
    }

    public function GetSubcategories()
    {
        $url = $this->_api_admin_url . '/es/subcategory';
        return ApiRequestsHelper::SendRequest('GET', $url);
    }

}