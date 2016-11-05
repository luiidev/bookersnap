angular.module('book.controller', [])

.controller('BookCtrl', function($uibModal, BookFactory, CalendarService, reservationService) {
	var vm = this;
	vm.turns = [];
	vm.hoursAvailable = [];

	var init = function() {
		listTurnAvailable();
	};

	var listTurnAvailable = function() {
		CalendarService.GetShiftByDate("2016-11-04", true).then(
			function success(response) {
				response = response.data.data;
				vm.turns = response;
				listHoursAvailable(vm.turns);
			},
			function error(response) {
				console.error("listTurnAvailable " + angular.toJson(response, true));
			}
		);
	};

	var listHoursAvailable = function(turns) {
		reservationService.getHours(turns).then(
			function success(response) {
				vm.hoursAvailable = response.hours;
			},
			function error(response) {
				console.error("getHours " + angular.toJson(response, true));
			}
		);
	};

	init();

});