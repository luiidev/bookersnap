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
		return function(items, categorias) {
			var salida = [];
			var tipo_categoria = Object.prototype.toString.call(categorias);

			if (tipo_categoria == "[object Object]") {
				salida = items;
				return salida;
			}

			if (tipo_categoria == "[object Array]") {
				if (categorias.length != []) {

					var filterPeople1 = false;
					var filterPeople2 = false;
					var filterPeople3 = false;

					angular.forEach(categorias, function(categoria) {
						var idcategoria = categoria.idcategoria;
						if (idcategoria === 2) {
							filterPeople1 = true;
						}
						if (idcategoria === 3) {
							filterPeople2 = true;
						}
						if (idcategoria === 4) {
							filterPeople3 = true;
						}
					});

					angular.forEach(items, function(item) {
						var filter = (filterPeople1 && item.num_people_1 > 0) || (filterPeople2 && item.num_people_2 > 0) || (filterPeople3 && item.num_people_3 > 0);
						if (filter) {
							salida.push(item);
						}
					});

					return salida;
					//return salida;
				} else {
					salida = items;
					return salida;
				}

			}


		};
	})
	.filter('reservaSel', function() {
		return function(items, categorias) {
			var salida = [];
			var tipo_categoria = Object.prototype.toString.call(categorias);

			if (tipo_categoria == "[object Object]") {
				salida = items;
				return salida;
			}

			if (tipo_categoria == "[object Array]") {
				if (categorias.length != []) {

					var filterWeb = false;
					var filterTelefono = false;
					var filterPortal = false;
					var filterRP = false;

					angular.forEach(categorias, function(categoria) {
						var idcategoria = categoria.id;
						if (idcategoria === 1) {
							filterWeb = true;
						}
						if (idcategoria === 2) {
							filterTelefono = true;
						}
						if (idcategoria === 3) {
							filterPortal = true;
						}
						if (idcategoria === 4) {
							filterRP = true;
						}
					});

					angular.forEach(items, function(item) {
						var filter = (filterWeb && item.res_source_type_id == 1) || (filterTelefono && item.res_source_type_id == 2) || (filterPortal && item.res_source_type_id == 3) || (filterRP && item.res_source_type_id == 4);
						if (filter) {
							salida.push(item);
						}
					});

					return salida;
					//return salida;
				} else {
					salida = items;
					return salida;
				}

			}


		};
	})
	.filter('turnoSel', function() {
		return function(items, categorias) {
			var salida = [];
			var tipo_categoria = Object.prototype.toString.call(categorias);

			if (tipo_categoria == "[object Object]") {
				salida = items;
				return salida;
			}

			if (tipo_categoria == "[object Array]") {
				if (categorias.length != []) {

					var filterDesayuno = false;
					var filterAlmuerzo = false;
					var filterCena = false;
					var filterBar = false;

					angular.forEach(categorias, function(categoria) {
						var idcategoria = categoria.id;
						if (idcategoria === 1) {
							filterDesayuno = true;
						}
						if (idcategoria === 2) {
							filterAlmuerzo = true;
						}
						if (idcategoria === 3) {
							filterCena = true;
						}
						if (idcategoria === 4) {
							filterBar = true;
						}
					});

					angular.forEach(items, function(item) {
						var filter = (filterDesayuno && item.res_type_turn_id == 1) || (filterAlmuerzo && item.res_type_turn_id == 2) || (filterCena && item.res_type_turn_id == 3) || (filterBar && item.res_type_turn_id == 4);
						if (filter) {
							salida.push(item);
						}
					});

					return salida;
					//return salida;
				} else {
					salida = items;
					return salida;
				}

			}


		};
	});