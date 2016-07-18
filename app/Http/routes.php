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

Route::get('/', function () {
    return view('welcome');
});

Route::group(['prefix' => 'v1/{lang}'], function () {
   Route::get('example', "Admin\Example\ExampleController@index");
   Route::get('example/{id}', "Admin\Example\ExampleController@getExample");
   Route::post('example/{id}', "Admin\Example\ExampleController@createExample");
   Route::put('example/{id}', "Admin\Example\ExampleController@updateExample");
   Route::delete('example/{id}', "Admin\Example\ExampleController@deleteExample");

});
