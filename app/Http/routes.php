<?php

/*
  |--------------------------------------------------------------------------
  | Application Routes
  |--------------------------------------------------------------------------
  |
  | Here is where you can register all of the routes for an application.
  | It's a breeze. Simply tell Laravel the URIs it should respond to
  | and give it the controller to call when that URI is requested.
  |
 */

Route::get('/admin/ms/{id}/mesas', ['uses' => 'Admin\MainController@mesas', /**'middleware' => 'auth'*/]);

Route::get('/admin/ms/{id}/reservation', function () {
    return view('reservation');
});

Route::get('/', function () {
})->middleware('checkCountry');

Route::group(['prefix' => 'test'], function () {
    Route::group(['prefix' => 'auth', 'middleware' => 'guest'], function () {
        Route::get('/', ['as' => 'microsite-login', 'uses' => 'Test\AuthController@Index']);
        Route::post('/', 'Test\AuthController@LoginBs');
        Route::post('/social', 'Test\AuthController@RedirectSocialLogin');
        Route::get('/social-callback', ['as' => 'social-callback',
            'uses' => 'Test\AuthController@CallbackSocialLogin'])->middleware(['social-login-token']);
    });

    Route::post('/auth/logout', ['middleware' => 'auth', 'as' => 'microsite-logout', 'uses' => 'Test\AuthController@Logout']);
    Route::get('/home', ['middleware' => 'auth', 'as' => 'microsite-home', 'uses' => 'Test\AuthController@Home']);
    Route::group(['prefix' => 'ajax'], function () {
        Route::post('/get-data', 'Test\AjaxController@GetData');
        Route::post('/guardar-categoria', 'Test\AjaxController@SaveCategory');
        Route::post('/subir-logo', 'Test\AjaxController@UploadLogo');
        Route::post('/subir-favicon', 'Test\AjaxController@UploadFavicon');
    });

    //test de redireccion por dominio, es importante agregar el middleware checkCountry para que funcione la
    //redireccion y el seteo de idioma
    Route::group(['prefix' => 'redirect', 'middleware' => 'checkCountry'], function () {
        Route::get('/', 'Test\PortalController@index');
    });

});


/*
  |--------------------------------------------------------------------------
  | Routes Example : v1/{lang}/admin/ms/{micro}/example
  |--------------------------------------------------------------------------
  |
  | Seguir este patron cuando agregemos un nuevo modulo.
  |
 */
Route::pattern('micro', '[0-9]+');

Route::group(['prefix' => 'v1/{lang}/admin/ms/{micro}/example'], function () {

    Route::get('example', "Admin\Example\ExampleController@index");
    Route::get('example/{id}', "Admin\Example\ExampleController@get");
    Route::post('example/{id}', "Admin\Example\ExampleController@create");
    Route::put('example/{id}', "Admin\Example\ExampleController@update");
    Route::delete('example/{id}', "Admin\Example\ExampleController@delete");
});

Route::group(['prefix' => 'v1/{lang}/admin/ms/{micro}/mesas', 'middleware' => 'route'], function () {

    Route::get('zone', "Admin\Tables\Zone\ZoneController@index");
    Route::get('zone/{id}', "Admin\Tables\Zone\ZoneController@get");
    Route::post('zone', "Admin\Tables\Zone\ZoneController@create");
    Route::put('zone', "Admin\Tables\Zone\ZoneController@update");
    Route::delete('zone/{id}', "Admin\Tables\Zone\ZoneController@delete");


    Route::get('turn', "Admin\Tables\Turn\TurnController@index");
    Route::get('turn/{turn}', "Admin\Tables\Turn\TurnController@get");
    Route::post('turn', "Admin\Tables\Turn\TurnController@create");
    Route::put('turn', "Admin\Tables\Turn\TurnController@update");

    Route::get('zone/{id}/type-turn/{type}/days', "Admin\Tables\Turn\TypeTurnController@days");

    Route::get('turn/{date}/availables', "Admin\Tables\Turn\TurnController@getAllAvailables");

    Route::get('reservation/getreservas', "Admin\Reservation\Floor\FloorController@getReservas");

    /*
      Route::delete('turn/{id}', "Admin\Tables\Turn\TurnController@delete"); */
});

Route::group(['prefix' => 'v1/{lang}/'], function () {
    Route::get('type-turn', "Admin\Tables\Turn\TypeTurnController@index");
});

Route::group(['prefix' => 'v1/{lang}/admin/ms/{micro}/reservation'], function () {

    Route::get('promotion', "Admin\Reservation\Promotion\PromotionController@index");
    Route::post('promotion', "Admin\Reservation\Promotion\PromotionController@createPromotion");
    Route::get('promotion/getlabel', "Admin\Reservation\Promotion\PromotionController@getlabel");
    Route::get('promotion/gethorario', "Admin\Reservation\Promotion\PromotionController@getHorario");
    Route::get('promotion/gettypographys', "Admin\Reservation\Promotion\PromotionController@gettypographys");
    Route::post('promotion/uploadFile', "Admin\Reservation\Promotion\PromotionController@uploadfile");
    Route::get('promotion/{promotion_id}', "Admin\Reservation\Promotion\PromotionController@showPromotion");
    Route::put('promotion/{promotion_id}', "Admin\Reservation\Promotion\PromotionController@updatePromotion");


    /* Flyer */
    Route::post('flyer/uploadFile', "Admin\Reservation\Promotion\FlyerController@uploadfile");
    Route::post('flyer', "Admin\Reservation\Promotion\FlyerController@storeFlyer");
    Route::put('flyer/{id_flyer}', "Admin\Reservation\Promotion\FlyerController@updateFlyer");
});

Route::group(['prefix' => 'master', 'namespace' => 'Master', 'middleware' => 'auth'], function () {

    Route::get('/', 'MainController@index');
    Route::group(['prefix' => '/ajax'], function () {
        Route::group(['prefix' => '/category'], function () {
            Route::get('/', 'CategoryController@index');
            Route::post('/', 'CategoryController@storeCategory');
            Route::get('/subcategories', 'CategoryController@showSubcategories');
            Route::get('/{id}', 'CategoryController@showCategory');
            Route::put('/{id}', 'CategoryController@updateCategory');
            Route::post('/upload/logo', 'CategoryController@uploadLogo');
            Route::post('/upload/favicon', 'CategoryController@uploadFavicon');
            Route::delete('/{id}', 'CategoryController@deleteCategory');
        });

        Route::group(['prefix' => '/microsite', 'namespace' => 'Microsite'], function () {
            Route::post('/', 'MicrositeController@storeMicrosite');
            Route::patch('/', 'MicrositeController@showPageMicrosite');
        });

        Route::group(['prefix' => '/microportal', 'namespace' => 'Microportal'], function () {
            Route::post('/', 'MicroportalController@storeMicroportal');
        });

        Route::group(['prefix' => '/roles', 'namespace' => 'Role'], function () {
            Route::post('/', 'RoleController@StoreRole');
            Route::put('/{id}', 'RoleController@UpdateRole');
            Route::post('/{id}/privileges', 'RoleController@StorePrivilegesByRole');
        });
    });
});

Route::get("/web/ls", function () {
    return view("localStorageApi");
});

Route::group(['prefix' => '/auth'], function () {
    Route::post("/loginBySharedToken", ["uses" => "Test\AuthController@loginBySharedToken", "middleware" => "guest"]);

    Route::post("/removeSharedToken", ["uses" => "Test\AuthController@removeSharedToken"]);
});




