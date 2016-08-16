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
                'size' => 80,
                'path' => '80x80',
                'side-to-resize' => 'width'
            ],
            [
                'size' => 160,
                'path' => '160x160',
                'side-to-resize' => 'width'
            ]
        ];
    }

    public static function GetDimensionsCategoryFavicon()
    {
        return [
            [
                'size' => 36,
                'path' => '36x36',
                'side-to-resize' => 'width'
            ],
            [
                'size' => 80,
                'path' => '80x80',
                'side-to-resize' => 'width'
            ],
        ];
    }

    public static function RemoveImagesFromDimensions(ImageService $imgService, string $baseFolder, array $dimensions, string $basename, bool $removeBase = true)
    {
        if ($removeBase) {
            $imgService->RemoveImage('files/' . $baseFolder . '/' . $basename);
        }

        foreach ($dimensions as $dim) {
            $dir = 'files/' . $baseFolder . '/image/' . $dim['path'] . '/' . $basename;
            $imgService->RemoveImage($dir);
        }
    }
}