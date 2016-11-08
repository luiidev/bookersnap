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
		CalendarService.GetShiftByDate(fecha_actual, true).then(
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

				generatedListBook(fecha_actual);
			},
			function error(response) {
				console.error("getHours " + angular.toJson(response, true));
			}
		);
	};

	var generatedListBook = function(date) {
		var params = getAsUriParameters({
			date: date
		});

		BookFactory.listReservationAndBlocks(true, params).then(
			function success(response) {
				//console.log("listReservationAndBlocks " + angular.toJson(response[0], true));

				vm.listBook = BookFactory.listBook(vm.hoursTurns, response[0], response[1]);

				console.log("listReservationAndBlocks " + angular.toJson(vm.listBook, true));
			},
			function error(response) {
				console.error("listReservationAndBlocks " + angular.toJson(response, true));
			}
		);
	};

	init();

});