angular.module('customtag.controller', [])
	.controller('CustomTagCtrl', function(CustomTagService) {
		var vm = this;
		vm.name = "";

		vm.guestTagAll = function() {
			CustomTagService.getAllTag().then(function success(response) {
				vm.guestTagList = response;
			}, function error(response) {
				messageErrorApi(response, "Error", "warning");
			});
		};

		vm.guestTagAll();

		vm.guestCreateTag = function(name) {
			vm.loading = true;
			CustomTagService.createTag(name).then(function success(response) {
				vm.loading = false;
				data = response;
				if (data != null) {
					vm.name = "";
					messageAlert("Success", "Se registro el Tag Correstamente", "success");
					vm.guestTagList.push(data);
				} else {
					messageErrorApi(response, "Este Tag ya se encuentra regitrado", "warning");
				}

			}, function error(response) {
				messageErrorApi(response, "Error", "warning");
			});
		};

		vm.guestDeleteTag = function(id) {
			vm.loading = true;
			console.log(id);
			CustomTagService.deleteTag(id).then(function success(response) {
				vm.loading = false;
				var index = CustomTagService.findWithAttr(vm.guestTagList, "id", id);
				vm.guestTagList.splice(index, 1);
			}, function(response) {
				vm.loading = false;
				messageErrorApi(response, "Error", "warning");
			});
		};

	});