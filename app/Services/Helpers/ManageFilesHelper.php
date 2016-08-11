<?php
/**
 * Created by PhpStorm.
 * User: BS
 * Date: 11/08/2016
 * Time: 11:50
 */

namespace App\Services\Helpers;


use App\Services\ImageService;

class ManageFilesHelper
{

    public static function GetDimensionsCategoryLogo()
    {
        return [
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
    }

    public static function GetDimensionsCategoryFavicon()
    {
        return [
            [
                'size' => 250,
                'path' => '250x250',
                'side-to-resize' => 'width'
            ],
            [
                'size' => 450,
                'path' => '450x450',
                'side-to-resize' => 'width'
            ]
        ];
    }

    public static function RemoveImagesFromDimensions(ImageService $imgService, string $baseFolder, array $dimensions, string $basename)
    {
        $imgService->RemoveImage('files/categories/' . $basename);
        foreach ($dimensions as $dim) {
            $dir = 'files/categories/image/' . $dim['path'] . '/' . $basename;
            $imgService->RemoveImage($dir);
        }
    }
}