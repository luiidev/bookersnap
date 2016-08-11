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
use Image;
use Intervention\Image\Image as ImageInstance;

/**
 * Class ImageService
 * @package App\Services
 * CONSIDERASIONES
 * ===============
 *  - Al hablar de dir se referira a solo de rutas relativas despues de la carpeta public. Ejm: /files/zonas/, files/zonas/imagen1.jpg
 *  - Al hablar de path se hablara de rutas completas dentro del servidor. Ejm: D:/xampp/htdocs/web.aplication.bookersnap/public/files...
 *  - Cuando se hable de basename de archivo sera solo el nombre del archivo con su extension. Ejm: image1.jpg, image2.png, etc...
 *  - Cuando se hable de fullname de archivo sera la ruta relativa del archivo luego del public path, incluyendo el basename.
 *    Ejm: files/zonas/iamge1.jpg
 */
class ImageService
{

    /**
     * Ruta completa a la carpeta public
     * @var
     */
    private $_public_path;
    /**
     * @var
     * nombre del directorio (luego de la carpeta public) en la cual se guardaran todas las imagenes
     * cuando se requiera formar una nueva ruta de destino usarla con la funcion public_path
     */
    private $_image_dir = "files";
    /**
     * @var
     * ruta completa del directorio de imagenes
     */
    private $_image_path;

    /**
     * @var
     * nombre del directorio temporal a la cual se iran las imagenes recien subidas
     */
    private $_temp_dir = "files_tmp";

    /**
     * @var
     * ruta completa del directorio de temporales
     */
    private $_temp_path;


    public function __construct()
    {
        $this->_public_path = public_path('/');
        $this->_image_path = $this->_public_path . $this->_image_dir;
        $this->_temp_path = $this->_public_path . $this->_temp_dir;
    }


    /**
     * Guarda la imagen que se ha subido en la carpeta de imagenes temporales
     * @param UploadedFile $file : archivo
     * @param string $outputFormat : formato de archivo con el cual se guardara la imagen, por defecto jpg
     * @param array $validations : Estructura que será usada para validar.
     * @return array
     * Ejemplo $validations:
     * [
     *   'mimes' => ['image/gif', 'image/jpeg', 'image/png', ...],
     *   'max-size' => 20971520,
     *   'dimensions' => [ (opcional)
     *      'min' => [
     *          'width' => 200,
     *          'height' => 200,
     *      ],
     *      'max' => [
     *          'width' => 5000,
     *          'height' => 5000
     *      ]
     *   ]
     * ]
     */
    public function saveImageToTemp(UploadedFile $file, array $validations)
    {
        $outputFormat = $file->getClientOriginalExtension();

        $this->validateFile($file->getMimeType(), $file->getSize(), $validations['mimes'], $validations['max-size']);

        $img = Image::make($file)->encode($outputFormat);

        $this->ValidateImageDimensions($img->width(), $img->height(),
            @$validations['dimensions']['min'], @$validations['dimensions']['max']);

        $name = $this->GetNameForImage($file->getClientOriginalName());

        if ($file->getMimeType() == 'image/gif') {
            $img->destroy();
            $name .= '.gif';
            $file->move($this->_temp_path, $name);
            return ['fullname' => $this->_temp_dir . '/' . $name, 'basename' => $name];
        }

        $basename = $name . '.' . $outputFormat;

        $this->createDirectoryIfNoExists($this->_temp_path);

        if ($img->width() > 2500) {
            $img = $this->resizeImageInMemory($img, 2500);
        }

        $img->save($this->_temp_path . '/' . $basename, 75);

        foreach ([65, 50] as $qualityLevel) {
            if ($img->filesize() > 1048576) {
                $img->save($this->_temp_path . '/' . $basename, $qualityLevel);
            } else {
                break;
            }
        }

        return ['fullname' => $this->_temp_dir . '/' . $basename, 'basename' => $basename];
    }

    /**
     * @param string $imageBasename
     * @param string $imageFullname
     * @param $baseFolder
     * @param $dimensions
     * @return ImageInstance
     * ejemplo estructura $dimensions:
     * [
     *   0 => [
     *      'size' => 300,
     *      'path' => '300x300',
     *      'side-to-resize' => 'width'
     *   ],
     *   1 => [
     *      'size' => 500,
     *      'path' => '500x500',
     *      'side-to-resize' => 'width'
     *   ],
     *   2 => [
     *      'size' => 800,
     *      'path' => '800x800',
     *      'side-to-resize' => 'width'
     *   ],
     *   ...
     * ]
     */
    public function ResizeImage(string $imageFullname, string $imageBasename, $baseFolder, $dimensions)
    {
        $imageInstance = Image::make($this->_public_path . $imageFullname);
        $imageInstance->backup();
        $this->createDirectoryIfNoExists($this->_image_path . '/' . $baseFolder);
        $this->createDirectoryIfNoExists($this->_image_path . '/' . $baseFolder . '/image');
        $imageInstance->save($this->_image_path . '/' . $baseFolder . '/' . $imageBasename);
        foreach ($dimensions as $dimension) {
            $imageInstance->reset();
            $imageInstance = $this->resizeImageInMemory($imageInstance, $dimension['size'], true, $dimension['side-to-resize']);
            $pathToResize = $this->_image_path . '/' . $baseFolder . '/image/' . $dimension['path'];
            $this->createDirectoryIfNoExists($pathToResize);
            $imageInstance->save($pathToResize . '/' . $imageBasename);
        }
        $imageInstance->destroy();
    }

    /**
     * Borra la imagen del servidor de la direccion que se envia(La direccion es despues de la carpeta public).
     * @param string $imagePath
     */
    public function RemoveImage(string $imageFullname)
    {
        File::delete($this->_public_path . $imageFullname);
    }

    //---------------------------------------------
    // PRIVATE FUNCTIONS
    //---------------------------------------------
    private function createDirectoryIfNoExists($path)
    {
        if (!File::exists($path)) {
            File::makeDirectory($path);
            $contents = '*';
            $contents .= "\n";
            $contents .= '!.gitignore';
            File::put($path . "\\.gitignore", $contents);
        }

    }

    /**
     * @param string $mimeType : mime de la imagen
     * @param int $size : en bytes
     * @param array $mimes : array con los mimes validos
     * @param int $maxSize : tamaño maximo del archivo
     */
    private function validateFile($mimeType, $size, array $mimes, int $maxSize)
    {
        // ['image/gif', 'image/jpeg', 'image/png', 'image/webp', 'application/octet-stream']
        if (!in_array($mimeType, $mimes)) {
            abort(400, trans('messages.invalid_field'));
        }
        //20971520
        if ($size > $maxSize) {
            abort(400, trans('messages.heavy_file'));
        }
    }

    private function ValidateImageDimensions($width, $height, array $minDimensions = null, array $maxDimensions = null)
    {
        if (!is_null($minDimensions)) {
            if ($width < $minDimensions["width"] || $height < $minDimensions["height"]) {
                abort(400, trans('messages.image_too_smaller'));
            }
        }

        if (!is_null($maxDimensions)) {
            if ($width > $maxDimensions["width"] || $height > $maxDimensions["height"]) {
                abort(400, trans('messages.image_too_bigger'));
            }
        }
    }

    private function GetNameForImage($originalName)
    {
        $prefix = $this->GenerateFilePrefix();
        return strtolower($prefix . "-" . $this->CleanName($originalName));
    }

    private function GenerateFilePrefix()
    {
        return str_random(10);
    }

    private function CleanName($originalName)
    {
        $originalName = str_replace(' ', '-', $originalName); // Replaces all spaces with hyphens.
        $originalName = $this->ReplaceAccents($originalName);
        return preg_replace('/[^A-Za-z0-9\-]/', '', pathinfo($originalName, PATHINFO_FILENAME)); // Removes special chars.
    }

    private function ReplaceAccents($str)
    {
        $search = explode(",", "ç,æ,œ,á,é,í,ó,ú,à,è,ì,ò,ù,ä,ë,ï,ö,ü,ÿ,â,ê,î,ô,û,å,ø,Ø,Å,Á,À,Â,Ä,È,É,Ê,Ë,Í,Î,Ï,Ì,Ò,Ó,Ô,Ö,Ú,Ù,Û,Ü,Ÿ,Ç,Æ,Œ");
        $replace = explode(",", "c,ae,oe,a,e,i,o,u,a,e,i,o,u,a,e,i,o,u,y,a,e,i,o,u,a,o,O,A,A,A,A,A,E,E,E,E,I,I,I,I,O,O,O,O,U,U,U,U,Y,C,AE,OE");
        return str_replace($search, $replace, $str);
    }

    /**
     * Cambia el tamaño de una imagen sin guardar los cambios.
     * @param ImageInstance $imageInstance
     * @param int $size tamanio nuevo en pixeles
     * @param bool $stayAspectRatio indica si se mantendra el aspect ratio (true por defecto)
     * @param string $sideToResize indica que lado de la imagen se redimensionara (width por defecto)
     * @return ImageInstance
     */
    private function resizeImageInMemory(ImageInstance $imageInstance, $size, $stayAspectRatio = true, $sideToResize = "width")
    {
        if ($stayAspectRatio) {
            $width = $heigth = $size;
            if ($sideToResize == "width") {
                $heigth = null;
            } else {
                $width = null;
            }
            $imageInstance->resize($width, $heigth, function ($constraint) {
                $constraint->aspectRatio();
            });
        } else {
            $imageInstance->resize($size, $size);
        }
        return $imageInstance;
    }

}