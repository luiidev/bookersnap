<?php
/**
 * Created by PhpStorm.
 * User: BS
 * Date: 10/08/2016
 * Time: 11:46
 */

namespace App\Services;


use Illuminate\Http\UploadedFile;
use File;

class ImageService
{
    /**
     * ruta relativa (luego de la carpeta public) en la cual se guardaran todas las imagenes
     * cuando se requiera formar una nueva ruta de destino usarla con la funcion public_path
     */
    private $PATH_TO_IMAGES = "files";

    /**
     * nombre de la carpeta temporal a la cual se iran las imagenes recien subidas
     */
    private $TEMP_FOLDER = "files_tmp";


    public function saveImageToTemp(UploadedFile $file, $outputFormat = "jpg", array $validations)
    {

        $this->validateMimeAndSize($file->getMimeType(), $file->getSize(), $validations);

        $img = $this->createImageInstance($file, $outputFormat);

        $this->validateImageDimensions(["w" => $img->width(), "h" => $img->height()], $validations['dimensions']['min'], $validations['dimensions']['max']);

        $name = strtolower(str_random(10) . "-" . $this->cleanName($file->getClientOriginalName()));
        $relativePath = $this->PATH_TO_IMAGES . "/" . $this->TEMP_FOLDER;
        $path = public_path($relativePath);

        if ($file->getMimeType() == "image/gif") {
            $img->destroy();
            $name .= ".gif";
            $file->move($path, $name);
            return ["uri" => "$relativePath/$name", "name" => $name];
        }

        $newRelativeName = "$relativePath/$name.$outputFormat";
        $newFullName = "$path/$name.$outputFormat";


        $this->createDirectoryIfNoExists($path);

        if ($img->width() > 2500) {
            $img = $this->resizeImageInMemory($img, 2500);
        }

        $img->save($newFullName);
        foreach ([75, 50] as $qualityLevel) {
            if ($img->filesize() > 1048576) {
                $img->save($newFullName, $qualityLevel);
            }
        }

        return ["uri" => $newRelativeName, "name" => "$name.$outputFormat"];
    }


    //---------------------------------------------
    // PRIVATE FUNCTIONS
    //---------------------------------------------
    private function createDirectoryIfNoExists($path)
    {
        File::exists($path) or File::makeDirectory($path);
    }

    private function validateMimeAndSize($mimeType, $size, array $validations)
    {
        // ['image/gif', 'image/jpeg', 'image/png', 'image/webp', 'application/octet-stream']
        if (!in_array($mimeType, $validations['mimes'])) {
            abort(400, trans('messages.invalid_field'));
        }
        //20971520
        if ($size > $validations['size']) {
            abort(400, trans('messages.heavy_file'));
        }
    }

}