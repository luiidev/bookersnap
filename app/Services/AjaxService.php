<?php
/**
 * Created by PhpStorm.
 * User: BS
 * Date: 08/08/2016
 * Time: 15:17
 */

namespace App\Services;


use App\Services\Helpers\ApiRequestsHelper;
use Config;
use Illuminate\Http\UploadedFile;
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

    public function SaveCategory(array $data)
    {

        //construir el array de redimensiones
        $dimensions = [
            [
                'size' => 300,
                'path' => '300x300',
                'side-to-resize' => 'width'
            ],
            [
                'size' => 500,
                'path' => '500x500',
                'side-to-resize' => 'width'
            ],
            [
                'size' => 800,
                'path' => '800x800',
                'side-to-resize' => 'width'
            ],
        ];

        $imageService = new ImageService();
        $imageService->ResizeImage($data['fullname'], $data['basename'], 'categories', $dimensions);

    }

}