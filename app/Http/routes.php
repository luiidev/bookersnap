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

    Route::group(['prefix' => 'ajax'], function(){
        Route::post('/get-data', 'Test\AjaxController@GetData');
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
Route::group(['prefix' => 'v1/{lang}/admin/ms/{micro}/example'], function () {

    Route::get('example', "Admin\Example\ExampleController@index");
    Route::get('example/{id}', "Admin\Example\ExampleController@get");
    Route::post('example/{id}', "Admin\Example\ExampleController@create");
    Route::put('example/{id}', "Admin\Example\ExampleController@update");
    Route::delete('example/{id}', "Admin\Example\ExampleController@delete");

});

Route::group(['prefix' => 'v1/{lang}/admin/ms/{micro}/mesas'], function () {

    Route::get('zone', "Admin\Tables\Zone\ZoneController@index");
    Route::get('zone/{id}', "Admin\Tables\Zone\ZoneController@get");
    Route::post('zone', "Admin\Tables\Zone\ZoneController@create");
    Route::put('zone', "Admin\Tables\Zone\ZoneController@update");
    Route::delete('zone/{id}', "Admin\Tables\Zone\ZoneController@delete");


 	Route::get('zone/{id}/turn', "Admin\Tables\Turn\TurnController@index");
	Route::get('zone/{id}/turn/{turn}', "Admin\Tables\Turn\TurnController@get");
	Route::post('zone/{id}/turn', "Admin\Tables\Turn\TurnController@create");
	Route::put('zone/{id}/turn', "Admin\Tables\Turn\TurnController@update");

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
	Route::get('promotion/getlabel', "Admin\Reservation\Promotion\PromotionController@getlabel");
	Route::post('promotion/uploadfile', "Admin\Reservation\Promotion\PromotionController@uploadfile");
	Route::post('promotion/uploadfile64', "Admin\Reservation\Promotion\PromotionController@uploadfile64");

});


