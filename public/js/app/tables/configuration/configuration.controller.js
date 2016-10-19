angular.module('configuration.controller', [])
	.controller('ConfigurationCtrl', ['$timeout', 'ConfigurationService', 'MenuConfigFactory', 'CustomTagGuestService', function($timeout, ConfigurationService, MenuConfigFactory, CustomTagGuestService) {
		var vm = this;
		vm.code = "";
		// vm.loading = true;
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

		//BASIC SECTION
		//Carga de configuracion inicial
		var configurationGet = function() {
			vm.loadingConfiguration = true;
			ConfigurationService.getConfig().then(function success(response) {
				vm.configuration = response;
				if (vm.configuration.res_code_status == 1) {
					getCod();
				}
				if (vm.configuration.res_privilege_status == 1) {
					getUser();
				}
				vm.loadingConfiguration = false;
			}, function error(response) {
				messageErrorApi(response, "Error", "warning");
				vm.loadingConfiguration = false;
			});
		};

		//Carga de percentages para configuracion inicial
		var percentageGet = function() {
			ConfigurationService.getPercentages().then(function success(response) {
				vm.percentageList = response;
			}, function error(response) {
				messageErrorApi(response, "Error", "warning");
			});
		};
		//Actualiza la configuration
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

		//CODE SECTION
		//Carga de codigos inicial
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

		//Actualiza el estado de codigo general
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

		//Agregar un codigo de reservacion
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

		//Eliminar un codigo de reservacion
		vm.deleteCode = function(code) {
			var index = CustomTagGuestService.findWithAttr(vm.codList, "code", code);
			vm.codList[index].delete = true;
			ConfigurationService.deleteCode(code).then(function success(response) {
				var index = CustomTagGuestService.findWithAttr(vm.codList, "code", code);
				vm.codList.splice(index, 1);
			}, function error(response) {
				messageAlert("Warning", "Ocurrio un error no se pudo eliminar", "warning");
				vm.codList[index].delete = false;
			});
		};


		//USER SECTION
		//Carga de usuario inicial
		var getUser = function() {
			vm.loadingGetUser = true;
			ConfigurationService.getAllPrivilegeUser().then(function success(response) {
				console.log(response);
				vm.userList = response;
				vm.loadingGetUser = false;
			}, function error(response) {
				vm.loadingGetUser = false;
				messageErrorApi(response, "Error", "warning");
			});
		};

		//Actualizar el estado de usuario general
		vm.updatePrivilegeStatus = function(res_privilege_status) {
			vm.loadingPrivilege = true;
			ConfigurationService.updatePrivilegeStatus(res_privilege_status).then(function success(response) {
				vm.configuration = response;
				if (vm.configuration.res_privilege_status == 1) {
					getUser();
				}
				vm.loadingPrivilege = false;
			}, function error(response) {
				alert = response.data.data;
				vm.loadingPrivilege = false;
			});
		};

		//Eliminar un usuario
		vm.deletePrivilegeUser = function(id) {
			var index = CustomTagGuestService.findWithAttr(vm.userList, "id", id);
			vm.userList[index].delete = true;
			ConfigurationService.deletePrivilegeUser(id).then(function success(response) {
				var index = CustomTagGuestService.findWithAttr(vm.userList, "id", id);
				vm.userList.splice(index, 1);
			}, function error(response) {
				messageAlert("Warning", "Ocurrio un error no se pudo eliminar", "warning");
				vm.userList[index].delete = false;
			});
		};

		vm.createPrivilegeUser = function(id) {
			vm.loadingCreatePrivilegeUser = true;
			ConfigurationService.storePrivilegeUser(id).then(function success(response) {
				vm.listUserAll = [];
				console.log(response);
				data = response;
				vm.userList.unshift(data);
				console.log(vm.userList);
				vm.loadingCreatePrivilegeUser = false;
			}, function error(response) {
				vm.listUserAll = [];
				vm.loadingCreatePrivilegeUser = false;
				messageAlert("Warning", "No se registro el privilegio del usuario porque ya existe", "warning");
			});
		};

		var auxiliar;
		vm.searchUser = function(search) {
			console.log(search);
			if (auxiliar) $timeout.cancel(auxiliar);
			if (search === "") {
				vm.listUserAll = [];
				return;
			}
			var busqueda = function() {
				console.log(search);
				ConfigurationService.getAllUser(search).then(function success(response) {
					vm.listUserAll = response;
					// console.log(vm.listUserAll);
				}, function error(response) {

				});
			};

			auxiliar = $timeout(busqueda, 500);

		};

		//Carga Inicial
		var init = function() {
			MenuConfigFactory.menuActive(4);
			configurationGet();
			percentageGet();
		};

		init();

	}]);