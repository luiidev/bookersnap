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

Route::group(['prefix' => 'v1/{lang}'], function () {

	Route::get('example', "Admin\Example\ExampleController@index");
	Route::get('example/{id}', "Admin\Example\ExampleController@getExample");
	Route::post('example/{id}', "Admin\Example\ExampleController@createExample");
	Route::put('example/{id}', "Admin\Example\ExampleController@updateExample");
	Route::delete('example/{id}', "Admin\Example\ExampleController@deleteExample");

	Route::get('zone', "Admin\Zone\ZoneController@index");
	Route::get('zone/{id}', "Admin\Zone\ZoneController@getZone");
	Route::post('zone', "Admin\Zone\ZoneController@createZone");
	Route::put('zone', "Admin\Zone\ZoneController@updateZone");
 	Route::delete('zone/{id}', "Admin\Zone\ZoneController@deleteZone");
});
