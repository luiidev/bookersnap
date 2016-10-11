angular.module('customtag.controller', [])
	.controller('CustomTagCtrl', function(CustomTagService) {
		var vm = this;

		vm.guestTagAll = function() {
			console.log("test");
			CustomTagService.getAllTag().then(function success(response) {
				vm.guestTagList = response;
				console.log(vm.guestTagList);
			}, function error(response) {
				// messageErrorApi(response.data, "Error", "warning", 0, true, response.status);
				console.log("fail");
			});
		};

	});