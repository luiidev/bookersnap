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

 	Route::get('turn', "Admin\Tables\Turn\TurnController@index");
	Route::get('turn/{id}', "Admin\Tables\Turn\TurnController@get");
	Route::post('turn', "Admin\Tables\Turn\TurnController@create");
	Route::put('turn', "Admin\Tables\Turn\TurnController@update");
 	Route::delete('turn/{id}', "Admin\Tables\Turn\TurnController@delete");
});


Route::group(['prefix' => 'v1/{lang}/admin/ms/{micro}/reservation'], function () {

	Route::get('promotion', "Admin\Reservation\Promotion\PromotionController@index");
	Route::get('promotion/uploadfile', "Admin\Reservation\Promotion\PromotionController@uploadfile");

});


