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

Route::get('/admin/ms/{id}/mesas', function () {
    return view('mesas');
});

Route::get('/admin/ms/{id}/reservation', function () {
    return view('reservation');
});

Route::group(['prefix' => 'test'], function () {
    Route::group(['prefix' => 'auth', 'middleware' => 'guest'], function () {
        Route::get('/', ['as' => 'microsite-login', 'uses' => 'Test\AuthController@Index']);
        Route::post('/', 'Test\AuthController@LoginBs');
        Route::post('/social', 'Test\AuthController@RedirectSocialLogin');
        Route::get('/social-callback', ['as' => 'social-callback',
            'uses' => 'Test\AuthController@CallbackSocialLogin'])->middleware(['social-login-token']);
    });

    Route::get('/auth/logout', ['middleware' => 'auth', 'as' => 'microsite-logout', 'uses' => 'Test\AuthController@Logout']);
    Route::get('/home', ['middleware' => 'auth', 'as' => 'microsite-home', 'uses' => 'Test\AuthController@Home']);
    Route::group(['prefix' => 'ajax'], function () {
        Route::post('/get-data', 'Test\AjaxController@GetData');
        Route::post('/guardar-categoria', 'Test\AjaxController@SaveCategory');
        Route::post('/subir-logo', 'Test\AjaxController@UploadLogo');
        Route::post('/subir-favicon', 'Test\AjaxController@UploadFavicon');
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

    /*
     Route::delete('turn/{id}', "Admin\Tables\Turn\TurnController@delete");*/
});

Route::group(['prefix' => 'v1/{lang}/'], function () {
    Route::get('type-turn', "Admin\Tables\Turn\TypeTurnController@index");
});

Route::group(['prefix' => 'v1/{lang}/admin/ms/{micro}/reservation'], function () {

    Route::get('promotion', "Admin\Reservation\Promotion\PromotionController@index");
    Route::get('promotion/{id}/getpromotion', "Admin\Reservation\Promotion\PromotionController@getpromotion");
    Route::get('promotion/getzones', "Admin\Reservation\Promotion\PromotionController@getzones");
    Route::get('promotion/getlabel', "Admin\Reservation\Promotion\PromotionController@getlabel");
    Route::post('promotion/uploadfile', "Admin\Reservation\Promotion\PromotionController@uploadfile");
    Route::post('promotion/uploadfile64', "Admin\Reservation\Promotion\PromotionController@uploadfile64");
    Route::get('promotion/gettypes', "Admin\Reservation\Promotion\PromotionController@gettypes");
    Route::get('promotion/gettypographys', "Admin\Reservation\Promotion\PromotionController@gettypographys");

});

Route::group(['prefix' => 'v1/{lang}/master', 'namespace' => 'Master'], function () {

    Route::get('/', 'MainController@index');
    Route::group(['prefix' => '/ajax'], function () {
        Route::get('/category', 'CategoryController@index');
        Route::get('/category/subcategories', 'CategoryController@showSubcategories');
        Route::get('/category/{id}', 'CategoryController@showCategory');
        Route::post('/category', 'CategoryController@storeCategory');
        Route::put('/category/{id}', 'CategoryController@updateCategory');
        Route::post('/category/upload/logo', 'CategoryController@uploadLogo');
        Route::post('/category/upload/favicon', 'CategoryController@uploadFavicon');
        Route::delete('/category/{id}', 'CategoryController@deleteCategory');
    });
});


