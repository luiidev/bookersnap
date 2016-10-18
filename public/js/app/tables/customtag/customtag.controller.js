angular.module('customtag.controller', [])
	.controller('CustomTagCtrl', function(CustomTagGuestService, CustomTagReservationService) {
		var vm = this;
		vm.nameG = "";
		vm.nameR = "";
		vm.reservationTagList = ['test'];
		vm.guestTagList = ['test'];
		vm.message = {
			tagsGuest: "No existen Tags de invitados",
			tagsReservation: "No existen Tags de reservación"
		};

		vm.guestTagAll = function() {
			vm.initCT = true;
			CustomTagGuestService.getAllTag().then(function success(response) {
				vm.guestTagList = response;
				vm.initCT = false;
			}, function error(response) {
				messageErrorApi(response, "Error", "warning");
				vm.initCT = false;
			});
		};

		vm.guestCreateTag = function(name) {
			vm.loadingCreateCustomTag = true;
			CustomTagGuestService.createTag(name).then(function success(response) {
				data = response;
				if (data != null) {
					vm.nameG = "";
					vm.guestTagList.unshift(data);
					messageAlert("Correcto", "Se registro el tag para invitados correstamente", "success");
				} else {
					messageErrorApi(response, "Este tag para invitados ya se encuentra regitrado", "warning");
				}
				vm.loadingCreateCustomTag = false;
			}, function error(response) {
				messageErrorApi(response, "Error", "warning");
				vm.loadingCreateCustomTag = false;
			});
		};

		vm.guestDeleteTag = function(id) {
			var index = CustomTagGuestService.findWithAttr(vm.guestTagList, "id", id);
			vm.guestTagList[index].delete = true;
			CustomTagGuestService.deleteTag(id).then(function success(response) {
				var index = CustomTagGuestService.findWithAttr(vm.guestTagList, "id", id);
				vm.guestTagList.splice(index, 1);
			}, function(response) {
				messageErrorApi(response, "Error", "warning");
			});
		};

		vm.reservationTagAll = function() {
			vm.initRT = true;
			CustomTagReservationService.getAllTag().then(function(response) {
				vm.reservationTagList = response;
				vm.initRT = false;
			}, function(response) {
				messageErrorApi(response, "Error", "warning");
				vm.initRT = false;
			});
		};

		vm.reservationCreateTag = function(name) {
			vm.loadingCreateReservationTag = true;
			CustomTagReservationService.createTag(name).then(function(response) {
				data = response;
				if (data != null) {
					vm.nameR = "";
					vm.reservationTagList.unshift(data);
					messageAlert("Correcto", "Se registro tag de reservación correstamente", "success");
				} else {
					messageErrorApi(response, "Este tag de reservacion ya se encuentra regitrado", "warning");
				}
				vm.loadingCreateReservationTag = false;
			}, function(response) {
				messageErrorApi(response, "Error", "warning");
				vm.loadingCreateReservationTag = false;
			});
		};

		vm.reservationDeleteTag = function(id) {
			var index = CustomTagGuestService.findWithAttr(vm.reservationTagList, "id", id);
			vm.reservationTagList[index].delete = true;
			CustomTagReservationService.deleteTag(id).then(function(response) {
				var index = CustomTagGuestService.findWithAttr(vm.reservationTagList, "id", id);
				vm.reservationTagList.splice(index, 1);
			}, function(response) {
				messageErrorApi(response, "Error", "warning");
			});
		};

		vm.guestTagAll();
		vm.reservationTagAll();
	});