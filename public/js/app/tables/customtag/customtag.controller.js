angular.module('customtag.controller', [])
	.controller('CustomTagCtrl', function(CustomTagGuestService, CustomTagReservationService) {
		var vm = this;
		vm.nameG = "";
		vm.nameR = "";

		vm.guestTagAll = function() {
			CustomTagGuestService.getAllTag().then(function success(response) {
				vm.guestTagList = response;
			}, function error(response) {
				messageErrorApi(response, "Error", "warning");
			});
		};

		vm.guestTagAll();

		vm.guestCreateTag = function(name) {
			vm.loading = true;
			CustomTagGuestService.createTag(name).then(function success(response) {
				data = response;
				if (data != null) {
					vm.nameG = "";
					vm.guestTagList.push(data);
					messageAlert("Success", "Se registro el Tag Correstamente", "success");
				} else {
					messageErrorApi(response, "Este Tag ya se encuentra regitrado", "warning");
				}
				vm.loading = false;
			}, function error(response) {
				messageErrorApi(response, "Error", "warning");
			});
		};

		vm.guestDeleteTag = function(id) {
			vm.loading = true;
			CustomTagGuestService.deleteTag(id).then(function success(response) {
				var index = CustomTagGuestService.findWithAttr(vm.guestTagList, "id", id);
				vm.guestTagList.splice(index, 1);
				vm.loading = false;
			}, function(response) {
				messageErrorApi(response, "Error", "warning");
				vm.loading = false;
			});
		};

		vm.reservationTagAll = function() {
			CustomTagReservationService.getAllTag().then(function(response) {
				vm.reservationTagList = response;
			}, function(response) {
				messageErrorApi(response, "Error", "warning");
			});
		};

		vm.reservationTagAll();

		vm.reservationCreateTag = function(name) {
			vm.loading = true;
			CustomTagReservationService.createTag(name).then(function(response) {
				data = response;
				if (data != null) {
					vm.nameR = "";
					vm.reservationTagList.push(data);
					messageAlert("Success", "Se registro el Tag Correstamente", "success");
				} else {
					messageErrorApi(response, "Este Tag ya se encuentra regitrado", "warning");
				}
				vm.loading = false;
			}, function(response) {
				messageErrorApi(response, "Error", "warning");
				vm.loading = false;
			});
		};

		vm.reservationDeleteTag = function(id) {
			vm.loading = true;
			CustomTagReservationService.deleteTag(id).then(function(response) {
				var index = CustomTagGuestService.findWithAttr(vm.reservationTagList, "id", id);
				vm.reservationTagList.splice(index, 1);
				vm.loading = false;
			}, function(response) {
				messageErrorApi(response, "Error", "warning");
				vm.loading = false;
			});
		};
	});