angular.module('book.controller', [])

.controller('BookCtrl', function($uibModal, BookFactory, CalendarService, reservationService) {
	var vm = this;
	vm.turns = [];
	vm.hoursTurns = []; //Lista de horas segun los turnos
	vm.listBook = []; //Listado del book 

	var fecha_actual = moment().format('YYYY-MM-DD');

	var init = function() {

		listTurnAvailable();

	};

	var listTurnAvailable = function() {
		CalendarService.GetShiftByDate("2016-11-04", true).then(
			function success(response) {
				response = response.data.data;
				vm.turns = response;
				listHoursTurns(vm.turns);
			},
			function error(response) {
				console.error("listTurnAvailable " + angular.toJson(response, true));
			}
		);
	};

	var listHoursTurns = function(turns) {
		reservationService.getHours(turns).then(
			function success(response) {
				vm.hoursTurns = response.hours;

				listReservations(fecha_actual);
			},
			function error(response) {
				console.error("getHours " + angular.toJson(response, true));
			}
		);
	};

	var listReservations = function(date) {
		var params = getAsUriParameters({
			date: date
		});

		BookFactory.getReservations(true, params).then(
			function success(response) {
				vm.listBook = BookFactory.listBook(vm.hoursTurns, response, null);
				console.log("listReservations " + angular.toJson(vm.listBook, true));
			},
			function error(response) {
				console.error("listReservations " + angular.toJson(response, true));
			}
		);
	};

	init();

});