angular.module('configuration.controller', [])
	.controller('ConfigurationCtrl', function(ConfigurationService, MenuConfigFactory, CustomTagGuestService) {
		var vm = this;
		vm.code = "";
		vm.loading = true;

		var configurationGet = function() {
			vm.loadingConfiguration = true;
			ConfigurationService.getConfig().then(function success(response) {
				vm.configuration = response;
				if (vm.configuration.res_code_status == 1) {
					getCod();
				}
				vm.loadingConfiguration = false;
			}, function error(response) {
				messageErrorApi(response, "Error", "warning");
				vm.loadingConfiguration = false;
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
			vm.loadingCode = true;
			ConfigurationService.getCode().then(function success(response) {
				vm.codList = response;
				vm.loadingCode = false;
			}, function error(response) {
				messageErrorApi(response, "Error", "warning");
				vm.loadingCode = false;
			});
		};

		var init = function() {
			configurationGet();
			percentageGet();
			MenuConfigFactory.menuActive(4);
		};


		vm.setCode = function(ms_microsite_id, code) {
			vm.loadingsetCode = true;
			ConfigurationService.createCode(ms_microsite_id, code).then(function success(response) {
				data = response;
				data.classNewCode = "info";
				vm.code = "";
				vm.codList.unshift(data);
				vm.loadingsetCode = false;
			}, function error(response) {
				vm.loadingsetCode = false;
				messageAlert("Warning", "No se registro el código porque ya existe", "warning");
			});
		};

		vm.deleteCode = function(code) {
			vm.loadingdeleteCode = code;
			var index = CustomTagGuestService.findWithAttr(vm.codList, "code", code);
			vm.codList[index].delete = true;
			ConfigurationService.deleteCode(code).then(function success(response) {
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

		vm.userList = [{
			id: 1,
			name: "Cesar Luis",
			email: "cesar@gmail.com",
			type: "facebook",
			delete: false
		}, {
			id: 2,
			name: "Samuel Ochoa",
			email: "samuel@gmail.com",
			type: "facebook",
			delete: false
		}, {
			id: 3,
			name: "Miguel Oropeza",
			email: "miguel@gmail.com",
			type: "facebook",
			delete: false
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
			});
		};

		vm.updateCodeStatus = function(res_code_status) {
			vm.loadingCode = true;
			ConfigurationService.updateCodeStatus(res_code_status).then(function success(response) {
				vm.configuration = response;
				if (vm.configuration.res_code_status == 1) {
					getCod();
				}
				vm.loadingCode = false;
			}, function error(response) {
				alert = response.data.data;
				vm.loadingCode = false;
			});
		};

		vm.updatePrivilegeStatus = function(res_privilege_status) {
			vm.loadingPrivilege = true;
			ConfigurationService.updatePrivilegeStatus(res_privilege_status).then(function success(response) {
				vm.configuration = response;
				vm.loadingPrivilege = false;
			}, function error(response) {
				alert = response.data.data;
				vm.loadingPrivilege = false;
			});
		};

		vm.deletePrivilegeUser = function(id) {
			console.log(name);
			vm.loadingdeleteUser = id;
			var index = CustomTagGuestService.findWithAttr(vm.userList, "id", id);
			console.log(index);
			vm.userList[index].delete = true;

			vm.userList.splice(index, 1);
			vm.loadingdeleteUser = null;
		};

		init();

	});