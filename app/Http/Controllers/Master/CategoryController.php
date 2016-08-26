<?php

namespace App\Http\Controllers\Master;

use App\Services\ImageService;
use App\Services\Master\CategoryService;
use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;

class CategoryController extends Controller
{

    protected $_categoryService;
    protected $_credentiales;

    public function __construct(CategoryService $categoryService)
    {
        $this->_categoryService = $categoryService;
        $this->_credentiales = ['type-admin' => 1];
    }

    public function index()
    {

        $response = $this->_categoryService->GetCategories();

        return response()->json($response, $response['statuscode']);
    }

    public function showCategory($lang, int $id)
    {
        $response = $this->_categoryService->GetCategory($id);
        return response()->json($response, $response['statuscode']);
    }

    public function storeCategory(Request $request)
    {

        $user_id = $this->GetUserId();

        $response = $this->_categoryService->SaveCategory($request->all(), $user_id, $this->_credentiales);

        return response()->json($response, $response['statuscode']);
    }

    public function updateCategory($lang, $id, Request $request)
    {

        $user_id = $this->GetUserId();

        $response = $this->_categoryService->UpdateCategory($request->all(), $id, $user_id, $this->_credentiales);

        return response()->json($response, $response['statuscode']);
    }

    public function deleteCategory($lang, int $id)
    {
        $response = $this->_categoryService->DeleteCategory($id, $this->_credentiales);

        return response()->json($response, $response['statuscode']);
    }

    public function uploadLogo(Request $request)
    {
        //obtenemos la imagen
        $imagen = $request->file('file');

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

    public function uploadFavicon(Request $request)
    {
        //obtenemos la imagen
        $imagen = $request->file('file');

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

    public function showSubcategories()
    {
        $response = $this->_categoryService->GetSubcategories();
        return response()->json($response, $response['statuscode']);
    }
}
