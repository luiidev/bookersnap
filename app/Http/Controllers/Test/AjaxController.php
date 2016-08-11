<?php

namespace App\Http\Controllers\Test;

use App\Services\AjaxService;
use App\Services\ImageService;
use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;
use Symfony\Component\HttpKernel\Exception\HttpException;

class AjaxController extends Controller
{

    protected $_ajaxService;

    public function __construct(AjaxService $ajaxService)
    {
        $this->_ajaxService = $ajaxService;
    }

    public function GetData()
    {
        try {
            $response = $this->_ajaxService->GetTestData();
            return response()->json($response, $response['statuscode']);
            return $this->CreateJsonResponse(true, $response['statuscode'], $response['msg'], $data);
        } catch (HttpException $e) {
            return $this->CreateJsonResponse(false, $e->getStatusCode(), null, null, false, null, $e->getMessage(), $e->getMessage() . "\n" . "{$e->getFile()}: {$e->getLine()}");
        } catch (\Exception $e) {
            return $this->CreateJsonResponse(false, 500, null, null, false, null, "Ocurrió un error interno", $e->getMessage() . "\n" . "{$e->getFile()}: {$e->getLine()}");
        }

    }

    function SaveCategory(Request $request)
    {

        $this->_ajaxService->SaveCategory($request->all());

        return response()->json([]);
    }

    /**
     * Recupera la imagen subida y la guarda en la carpeta temporal
     * @return \Illuminate\Http\JsonResponse
     */
    function UploadImageCategory()
    {
        //obtenemos la imagen
        $request = request();
        $imagen = $request->file('imagen');

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
}
