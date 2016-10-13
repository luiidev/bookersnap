angular.module('configuration.controller', [])
	.controller('ConfigurationCtrl', function(ConfigurationService) {
		var vm = this;

		vm.configurationGet = function() {
			ConfigurationService.getConfig().then(function success(response) {

			}, function error(response) {

			});
		};

		vm.configurationUpdate = function(id) {
			ConfigurationService.updateConfig(id).then(function success(response) {

			}, function error(response) {

			});
		};
	});