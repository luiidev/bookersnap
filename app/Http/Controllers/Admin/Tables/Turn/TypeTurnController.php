<?php

namespace App\Http\Controllers\Admin\Tables\Turn;
use App\Http\Controllers\Controller as Controller;

class TypeTurnController extends Controller
{
	public function index(){
		return response()->json(
			array (
				0 => 
				array (
					'id' => 1,
					'name' => 'Desayuno',
					'status' => 1,
					),
				1 => 
				array (
					'id' => 2,
					'name' => 'Almuerzo',
					'status' => 1,
					),
				2 => 
				array (
					'id' => 3,
					'name' => 'Cena',
					'status' => 1,
					),
				3 => 
				array (
					'id' => 4,
					'name' => 'Bar',
					'status' => 1,
					),
				)

			);
	}

	public function days($id,$type){
		return response()->json(
			array (
				0 => 
				array (
					'day' => 1,
					),
				1 => 
				array (
					'day' => 2,
					),
				2 => 
				array (
					'day' => 3,
					)
				)
			);
	}

}
