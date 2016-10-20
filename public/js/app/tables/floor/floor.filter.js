angular.module('floor.filter', [])
	.filter("statusReservation", function() {
		return function(valor) {
			if (valor !== null) {
				var name_status = "";
				switch (valor) {
					case 1:
						name_status = "not-confirmed";
						break;
					case 2:
						name_status = "confirmed";
						break;
					case 3:
						name_status = "left-message";
						break;
					case 4:
						name_status = "no-answer";
						break;
					case 5:
						name_status = "wrong-number";
						break;
					case 6:
						name_status = "partially-arrived";
						break;
					case 7:
						name_status = "all-arrived";
						break;
					case 8:
						name_status = "paged";
						break;
					case 9:
						name_status = "running-late";
						break;
					case 10:
						name_status = "finished";
						break;
					case 11:
						name_status = "canceled-guest";
						break;
					case 12:
						name_status = "canceled-restaurant";
						break;
					case 13:
						name_status = "no-show";
						break;
					case 14:
						name_status = "seated";
						break;
					case 15:
						name_status = "partially-seated";
						break;
					case 16:
						name_status = "entree";
						break;
					case 17:
						name_status = "dessert";
						break;
					case 18:
						name_status = "table-cleared";
						break;
					case 19:
						name_status = "appetizer";
						break;
					case 20:
						name_status = "check-dropped";
						break;
					case 21:
						name_status = "check-paid";
						break;
					default:
						name_status = "";
						break;
				}
				return name_status;
			}
		};
	})
	.filter("statusOnlySeated", function() {
		return function(valor) {
			if (valor !== null) {
				var name_status = "";
				switch (valor) {
					case 14:
						name_status = "seated";
						break;
					case 15:
						name_status = "partially-seated";
						break;
					case 16:
						name_status = "entree";
						break;
					case 17:
						name_status = "dessert";
						break;
					case 18:
						name_status = "table-cleared";
						break;
					case 19:
						name_status = "appetizer";
						break;
					case 20:
						name_status = "check-dropped";
						break;
					case 21:
						name_status = "check-paid";
						break;
					default:
						name_status = "";
						break;
				}
				return name_status;
			}
		};
	})
	.filter("statusCondicion", function() {
		return function(items) {
			var salida = [];
			angular.forEach(items, function(item) {
				if (item.res_reservation_status_id !== null) {
					var status = item.res_reservation_status_id;
					switch (status) {
						case 1:
						case 2:
						case 3:
						case 4:
						case 5:
						case 6:
						case 7:
						case 8:
						case 9:
							salida.push(item);
							break;
					}

				}
			});
			return salida;
		};
	})
	.filter("statusSeated", function() {
		return function(items) {
			var salida = [];
			angular.forEach(items, function(item) {
				if (item.res_reservation_status_id !== null) {
					var status = item.res_reservation_status_id;
					switch (status) {
						case 14:
						case 15:
						case 16:
						case 17:
						case 18:
						case 19:
						case 20:
						case 21:
							salida.push(item);
							break;
					}

				}
			});
			return salida;
		};
	})
	.filter('peopleSel', function() {
		return function(items, categoria) {
			var salida = [];
			var tipo_categoria = Object.prototype.toString.call(categoria);

			if (tipo_categoria == "[object Object]") {
				salida = items;
				return salida;
			}

			if (tipo_categoria == "[object Array]") {

				//console.log("categoria es un array");

			}

			//console.log("[Object Array]", "Object Object]");
			/*
			var idcategoria = categoria.idcategoria;
			switch (idcategoria) {
				case 2:
					angular.forEach(items, function(item) {
						if (item.num_people_1 != 0) {
							salida.push(item);
						}
					});
					break;
				case 3:
					angular.forEach(items, function(item) {
						if (item.num_people_2 != 0) {
							salida.push(item);
						}
					});
					break;
				case 4:
					angular.forEach(items, function(item) {
						if (item.num_people_3 != 0) {
							salida.push(item);
						}
					});
					break;
				case 1:
					salida = items;
					break;
			}*/

		};
	})
	.filter('typeSel', function() {
		return function(items, categoria) {
			var salida = [];
			if (categoria) {
				var id = categoria.id;
				switch (id) {
					case 0:
						salida = items;
						break;
					default: //Desayuno//Almuerzo//Cena//Bar
						angular.forEach(items, function(item) {
							//console.log(item.start_time + ' - ' + item.end_time);
							/*if (item.num_people_3 != 0) {
								salida.push(item);
							}*/
						});
						//console.log(categoria.turn.hours_end);
						salida = items;
						break;
				}
			}
			return salida;
		};
	});