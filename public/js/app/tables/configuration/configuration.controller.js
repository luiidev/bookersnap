angular.module('configuration.controller', ['ngAnimate', 'ui.bootstrap'])
    .controller('ConfigurationCtrl', ['$timeout', 'ConfigurationService', 'MenuConfigFactory', 'CustomTagGuestService', function($timeout, ConfigurationService, MenuConfigFactory, CustomTagGuestService) {
        var vm = this;
        vm.code = "";

        vm.cantUserList = ConfigurationService.initDataFakeList(100, "persona");
        vm.cantTableList = ConfigurationService.initDataFakeList(20, "mesa");
        vm.cantTableListPie = ConfigurationService.initDataFakeList(1000, "persona");
        vm.timeList = ConfigurationService.initDataFakeHour();

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
                messageErrorApi(response.data, "Error", "warning");
                vm.loadingConfiguration = false;
            });
        };

        //Carga de percentages para configuracion inicial
        var percentageGet = function() {
            ConfigurationService.getPercentages().then(function success(response) {
                vm.percentageList = response;
            }, function error(response) {
                messageErrorApi(response.data, "Error", "warning");
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
                // console.log(response);
                messageErrorApi(response.data, "Error", "warning");
                vm.flagSaveConfiguration = false;
                alert = response.data;
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
                messageErrorApi(response.data, "Error", "warning");
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
                if (res_code_status == 1) {
                    vm.configuration.res_code_status = 0;
                } else {
                    vm.configuration.res_code_status = 1;
                }
                messageErrorApi(response.data, "Error", "warning");
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
                messageErrorApi(response.data, "Error", "warning");
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
            if (id !== null) {
                vm.loadingCreatePrivilegeUser = true;
                ConfigurationService.storePrivilegeUser(id).then(function success(response) {
                    data = response;
                    console.log(data);
                    vm.userList.unshift(data);
                    vm.search = null;
                    vm.userId = null;
                    vm.loadingCreatePrivilegeUser = false;
                }, function error(response) {
                    vm.loadingCreatePrivilegeUser = false;
                    messageAlert("Warning", "No se registro el privilegio del usuario porque ya existe", "warning");
                });
            } else {
                vm.search = null;
                messageAlert("Warning", "No se registro el privilegio del usuario porque el usuario no existe", "warning");
            }

        };

        var auxiliar;

        // var clickClose = function() {
        // 	angular.element($window).bind('click', function(e) {
        // 		var container = $("#custom-popup-wrapper");
        // 		if (container.has(e.target).length === 0) {
        // 			$scope.$apply(function() {
        // 				vm.noResult = false;
        // 			});
        // 		}
        // 	});
        // };

        vm.searchUser = function(search) {
            vm.loadingSearchUser = true;
            if (vm.searchOld != search) vm.userId = null;
            // if (auxiliar) $timeout.cancel(auxiliar);
            if (search === "") {
                vm.listUserAll = [];
                return;
            }
            var busqueda = function() {
                return ConfigurationService.getAllUser(search).then(function success(response) {
                    vm.listUserAll = response;
                    console.log(vm.listUserAll);
                    vm.loadingSearchUser = false;
                    // console.log(vm.listUserAll);
                    return response.map(function(item) {
                        // console.log(item);
                        return item;
                    }, function error(response) {

                    });
                });
            };
            // auxiliar = $timeout(busqueda, 500);
            return busqueda();
        };

        vm.initSearch = function(user) {
            vm.search = user.firstname + ' ' + user.lastname;
            vm.searchOld = vm.search;
            vm.userId = user.id;
            vm.listUserAll = [];
        };

        //Carga Inicial
        var init = function() {
            MenuConfigFactory.menuActive(4);
            configurationGet();
            percentageGet();
        };

        vm.test = function() {
            vm.noResults = false;
        };

        init();

    }]);