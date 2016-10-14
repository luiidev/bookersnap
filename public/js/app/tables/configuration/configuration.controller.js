angular.module('configuration.controller', [])
	.controller('ConfigurationCtrl', function(ConfigurationService, MenuConfigFactory, CustomTagGuestService) {
		var vm = this;
		vm.code = "";

		var configurationGet = function() {
			ConfigurationService.getConfig().then(function success(response) {
				vm.configuration = response;
				console.log(vm.configuration);
			}, function error(response) {
				messageErrorApi(response, "Error", "warning");
			});
		};

		var percentageGet = function() {
			ConfigurationService.getPercentages().then(function success(response) {
				vm.percentageList = response;
				console.log(vm.percentageList);
			}, function error(response) {
				messageErrorApi(response, "Error", "warning");
			});
		};

		var getCod = function() {
			ConfigurationService.getCode().then(function success(response) {
				vm.codList = response;
			}, function error(response) {
				messageErrorApi(response, "Error", "warning");
			});
		};

		var init = function() {
			configurationGet();
			percentageGet();
			getCod();
			MenuConfigFactory.menuActive(4);
		};


		vm.setCode = function(ms_microsite_id, code) {
			ConfigurationService.createCode(ms_microsite_id, code).then(function success(response) {
				data = response;
				vm.code = "";
				vm.codList.push(data);
				messageAlert("Success", "Se registro el código correstamente", "success");
				// vm.loading = false;
			}, function error(response) {
				messageAlert("Warning", "No se registro el código porque ya existe", "warning");
			});
		};

		vm.deleteCode = function(code) {
			ConfigurationService.deleteCode(code).then(function success(response) {
				messageAlert("Success", "Se registro el código correstamente", "success");
				var index = CustomTagGuestService.findWithAttr(vm.codList, "code", code);
				vm.guestTagList.splice(index, 1);
			}, function error(response) {
				messageAlert("Warning", "Ocurrio un error no se pudo eliminar", "warning");
			});
		};

		vm.timeList = [{
			id: 1,
			option: "10 minutos"
		}, {
			id: 2,
			option: "20 minutos"
		}, {

		}, {
			id: 3,
			option: "30 minutos"
		}];

		vm.cantUserList = [{
			id: 1,
			option: "1 persona"
		}, {
			id: 2,
			option: "2 personas"
		}, {
			id: 3,
			option: "3 personas"
		}, ];

		vm.cantTableList = [{
			id: 1,
			option: "1 mesa"
		}, {
			id: 2,
			option: "2 mesas"
		}, {
			id: 3,
			option: "3 mesas"
		}, ];

		vm.configurationUpdate = function(id, configuration) {
			ConfigurationService.updateConfig(id, configuration).then(function success(response) {
				vm.configuration = response;
				console.log(response);
				messageAlert("Actualizo", "Se actualizo correctamente", "success");
			}, function error(response) {
				alert = response.data.data;
				console.log(alert);
				// messageErrorApi(response, "Error", "warning");
			});
		};



		init();

	});