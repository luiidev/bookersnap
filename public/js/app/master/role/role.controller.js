angular.module('role.controller', ['bsLoadingOverlay'])
    .controller('RolesListController', ["RoleServiceApiAdmin", "ngTableParams", "bsLoadingOverlayService", "$filter",
         function (RoleService, ngTableParams, bsLoadingOverlayService, $filter) {

        var vm = this;

        vm.can = {
            editRole: true, 
            createRole: true
        };

        vm.flags = {
            isUpdating: false,
            isLoading: false
        };

        vm.rolesList = [];

        vm.role = {
            name: "",
            type_admin_id: null
        };

        vm.listarRoles = function () {
            vm.flags.isLoading = true;
            bsLoadingOverlayService.start();

            RoleService.GetRoles()
                .then(function(response) {
                    vm.rolesList = response.data.data.roles;
                    vm.typesRoleList = response.data.data.types_role;
                    initTableRoles();
                }).finally(function() {
                    if (vm.typesRoleList.length) vm.filterRole(vm.typesRoleList[0].id);
                    bsLoadingOverlayService.stop();
                    vm.flags.isLoading = false;
                });
        };

        vm.registerRole = function () {
            if (vm.role.name.trim() === "" && vm.role.name.length <= 3) {
                vm.role.name = null;
                return message.alert('Ingrese el nombre del rol');
            }

            bsLoadingOverlayService.start();

            RoleService.CreateRole(vm.role)
                .then(function(response) {
                        vm.rolesList.push(response.data.data);
                        vm.role.name = "";
                        message.success(response.data.msg);
                })
                .catch(function(error) {
                    message.apiError(error);
                })
                .finally(function() {
                    refreshTable();
                    bsLoadingOverlayService.stop();
                });
        };

        vm.editRole = function (item) {
            item.$backup = {};
            item.$backup.name = item.name;
            item.$edit = true;
        };

        vm.discardEditRole = function (item) {
            item.$errors = null;
            item.name = item.$backup.name;
            item.$edit = false;
        };

        vm.updateRole = function (item) {
            if (item.name.trim() === "") {
                return message.alert('El nombre de rol no puede quedar vacio.');
            }
            
            item.$changeStatus = false;

            vm.flags.isUpdating = true;
            bsLoadingOverlayService.stop();

            RoleService.UpdateRole(item.id, item)
                .then(function(response) {
                    item.$edit = false;
                    message.success('Rol actualizado');
                })
                .catch(function(error) {
                    message.apiError(error);
                })
                .finally(function() {
                    vm.flags.isUpdating = false;
                    bsLoadingOverlayService.stop();
                });
        };

        vm.changeRoleStatus = function (item) {
            if (vm.flags.isUpdating) {
                return;
            }
            var previousStatus = (item.status == 1 ? 0 : 1);

            vm.flags.isUpdating = true;
            bsLoadingOverlayService.start();

            RoleService.ChangeStatus(item.id, item)
                .catch(function(error) {
                    item.status = previousStatus;
                    message.apiError(error);
                })
                .finally(function() {
                    vm.flags.isUpdating = false;
                    bsLoadingOverlayService.stop();
                });
        };

        function initTableRoles() {
            vm.tableRoles = new ngTableParams({
                page: 1,// show first page
                count: 1000, // count per page
            }, {
                counts: [],
                data: vm.rolesList,
            });
        }

        function refreshTable() {
            vm.tableRoles.reload();
        }

        vm.filterRole = function(id) {
            vm.role.type_admin_id = id;
        };

        /**
         * Init Module
         */
        function init() {
            vm.listarRoles();
        }

        init();

    }])
    //----------------------------------------------
    // PRIVILEGIOS POR ROLES
    //----------------------------------------------
    .controller('RolesPrivilegesController', ["RoleServiceApiAdmin", "bsLoadingOverlayService", "$stateParams",
        function (RoleService, bsLoadingOverlayService, $stateParams) {

        var vm = this;
        vm.role_id = $stateParams.id;
        vm.role = {};

        vm.checkAllPrivilegesChildren = function (item, parent) {
            if (parent !== null) {
                if (parent.checkeable && parent.checked === 0 && item.checked == 1) {
                    parent.checked = 1;
                } else {
                    var count = 0;
                    angular.forEach(parent.children, function (child) {
                        count += child.checked;
                    });

                    if (count === 0) {
                        parent.checked = 0;
                    }
                }
            }
            angular.forEach(item.children, function (child) {
                child.checked = item.checked;
                if (child.children) {
                    angular.forEach(child.children, function (child2) {
                        child2.checked = item.checked;
                    });
                }
            });
        };

        vm.checklPrivilegesParent = function(parent) {
            var c = 0;
            angular.forEach(parent.children, function (child) {
                if (child.checked) {
                    c++;
                }
            });
            parent.checked = Object.keys(parent.children).length == c ? 1 : 0;
        };

        vm.saveChanges = function () {

            bsLoadingOverlayService.start();

            RoleService.SavePrivileges(vm.role_id, vm.privileges)
                .then(function(response) {
                    console.log(response);
                    //AclService.setAbilities(Response.data.data.acl);
                    message.success("Se actualizaron los privilegios.");
                }).catch(function(error) {
                    message.apiError(error);
                }).finally(function() {
                    bsLoadingOverlayService.stop();
                });
        };

        function loadPrivileges() {
            bsLoadingOverlayService.start();

            RoleService.GetPrivileges(vm.role_id)
                .then(function(response) {
                    vm.privileges = response.data.data.privileges;
                    vm.role = response.data.data.role;
                }).catch(function(error) {
                    message.error("Ocurrio un error");
                }).finally(function() {
                    bsLoadingOverlayService.stop();
                });
        }

        /**
         * Init Module
         */
        function init() {
            loadPrivileges();
        }

        init();
    }]);