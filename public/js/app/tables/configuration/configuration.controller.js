angular.module('configuration.controller', [])
	.controller('ConfigurationCtrl', function(ConfigurationService, MenuConfigFactory, CustomTagGuestService) {
		var vm = this;
		vm.code = "";
		vm.loading = true;
		// vm.configuration.res_code_status;

		var configurationGet = function() {
			ConfigurationService.getConfig().then(function success(response) {
				vm.configuration = response;
			}, function error(response) {
				messageErrorApi(response, "Error", "warning");
			});
		};

		var percentageGet = function() {
			ConfigurationService.getPercentages().then(function success(response) {
				vm.percentageList = response;
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
			vm.loadingsetCode = true;
			ConfigurationService.createCode(ms_microsite_id, code).then(function success(response) {
				data = response;
				data.classNewCode = "info";
				vm.code = "";
				vm.codList.unshift(data);
				// messageAlert("Success", "Se registro el código correstamente", "success");
				vm.loadingsetCode = false;
			}, function error(response) {
				vm.loadingsetCode = false;
				messageAlert("Warning", "No se registro el código porque ya existe", "warning");
			});
		};

		vm.deleteCode = function(code) {
			vm.loadingdeleteCode = code;
			var index = CustomTagGuestService.findWithAttr(vm.codList, "code", code);
			console.log(index);
			vm.codList[index].delete = true;
			ConfigurationService.deleteCode(code).then(function success(response) {
				// messageAlert("Success", "Se registro el código correstamente", "success");
				var index = CustomTagGuestService.findWithAttr(vm.codList, "code", code);
				vm.codList.splice(index, 1);
				vm.loadingdeleteCode = null;
			}, function error(response) {
				vm.loadingdeleteCode = null;
				messageAlert("Warning", "Ocurrio un error no se pudo eliminar", "warning");
				vm.codList[index].delete = false;
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
			vm.flagSaveConfiguration = true;
			ConfigurationService.updateConfig(id, configuration).then(function success(response) {
				vm.configuration = response;
				messageAlert("Actualizo", "Se actualizo correctamente", "success");
				vm.flagSaveConfiguration = false;
			}, function error(response) {
				vm.flagSaveConfiguration = false;
				alert = response.data.data;
				// messageErrorApi(response, "Error", "warning");
			});
		};

		vm.updateCodeStatus = function(id, configuration) {
			vm.loading = true;
			ConfigurationService.updateCodeStatus(id, configuration).then(function success(response) {
				vm.configuration = response;
				vm.loading = false;
				// messageAlert("Actualizo", "Se actualizo correctamente", "success");
			}, function error(response) {
				alert = response.data.data;
				vm.loading = false;
				// messageErrorApi(response, "Error", "warning");
			});
		};

		init();

	});