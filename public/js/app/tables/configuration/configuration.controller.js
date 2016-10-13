angular.module('configuration.controller', [])
	.controller('ConfigurationCtrl', function(ConfigurationService) {
		var vm = this;


		function configurationGet() {
			ConfigurationService.getConfig().then(function success(response) {
				vm.configuration = response;
				console.log(vm.configuration);
			}, function error(response) {
				messageErrorApi(response, "Error", "warning");
			});
		}

		function percentageGet() {
			ConfigurationService.getPercentages().then(function success(response) {
				vm.percentageList = response;
				console.log(vm.percentageList);
			}, function error(response) {
				messageErrorApi(response, "Error", "warning");
			});
		}

		function init() {
			configurationGet();
			percentageGet();
			vm.searchView = 1;
		}

		init();

		vm.configurationUpdate = function(id, configuration) {
			ConfigurationService.updateConfig(id, configuration).then(function success(response) {
				vm.configuration = response;
				console.log(response);
				messageAlert("Success", "Se registro el Tag Correstamente", "success");
			}, function error(response) {
				alert = response.data.data;
				console.log(alert);
				// messageErrorApi(response, "Error", "warning");
			});
		};

	});