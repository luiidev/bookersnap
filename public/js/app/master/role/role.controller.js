/**
 * Created by BS on 12/08/2016.
 */
angular.module('role.controller', ['bsLoadingOverlay'])
    .run(function (bsLoadingOverlayService) {
        bsLoadingOverlayService.setGlobalConfig({
            delay: 0, // Minimal delay to hide loading overlay in ms.
            activeClass: undefined, // Class that is added to the element where bs-loading-overlay is applied when the overlay is active.
            templateUrl: 'overlay-template.html', // Template url for overlay element. If not specified - no overlay element is created.
            templateOptions: undefined // Options that are passed to overlay template (specified by templateUrl option above).
        });
    })
    //----------------------------------------------
    // LISTAR ROLES
    //----------------------------------------------
    .controller('RolesListController', function (RoleService, ngTableParams, bsLoadingOverlayService, $filter) {
        var vm = this;
        vm.can = {
            editRole: true,
            createRole: true
        };
        vm.flags = {
            isUpdating: false
        };
        vm.rolesList = [];

        vm.listarRoles = function () {
            RoleService.GetRoles({
                BeforeSend: function () {
                    bsLoadingOverlayService.start();

                },
                OnSuccess: function (Response) {
                    bsLoadingOverlayService.stop();
                    vm.rolesList = Response.data.data;
                    initTableRoles();
                },
                OnError: function (Response) {
                    bsLoadingOverlayService.stop();
                }
            });
        };

        vm.registerRole = function () {
            if (vm.role.name.trim() == "") {
                swal('Ingrese el nombre del rol', '', 'warning');
                return;
            }
            RoleService.CreateRole(vm.role, {
                OnSuccess: function (Response) {
                    bsLoadingOverlayService.stop();
                    if (Response.status == 201) {
                        initNewRole();
                        vm.listarRoles();
                        messageAlert('Rol creado', '', 'success');
                    } else {
                        swal("Error", "Ocurrió un error en el servidor", "error");
                    }
                },
                OnError: function (Response) {
                    bsLoadingOverlayService.stop();
                    try {
                        var data = Response.data;
                        if (Response.status == 422) {
                            var errors = '';
                            angular.forEach(Response.data.error.errors, function (error, key) {
                                errors += '\n- ' + error + '\n';
                            });
                            swal(Response.data.error.user_msg, errors, "error")
                        } else {
                            swal("Error", data.error.user_msg, "error")
                        }
                    } catch ($e) {
                        swal("Error", "Ocurrió un error en el servidor", "error");
                    }
                },
                BeforeSend: function () {
                    bsLoadingOverlayService.start();
                }
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
            if (item.name.trim() == "") {
                return;
            }
            //para el acl
            //if (bsAcl.getRole().id == item.id) {
            //    Popup.$Alert('Advertencia', 'No se puede editar este rol ya que ' +
            //        'está siendo usado actualmente por su usuario.', null, 'warning');
            //    return;
            //}
            //
            //item.$changeStatus = false;
            RoleService.UpdateRole(item.id, item, {
                OnSuccess: function (Response) {
                    vm.flags.isUpdating = false;
                    bsLoadingOverlayService.stop();
                    try {
                        if (Response.data.statuscode == 200) {
                            item.$edit = false;
                            messageAlert('Rol actualizado', '', 'success');
                        }
                    } catch ($e) {
                        swal("Error", "Ocurrió un error en el servidor", "error");
                    }
                },
                OnError: function (Response) {
                    vm.flags.isUpdating = false;
                    bsLoadingOverlayService.stop();
                    var data = Response.data;
                    if (Response.status == 401) {
                        swal("Error", "No tiene permisos para realizar esta acción", "error");
                    } else if (angular.isUndefined(data.error)) {
                        swal("Error", "Ocurrió un error en el servidor", "error");
                    } else if (Response.status == 406 || Response.status == 422) {
                        var errors = '';
                        angular.forEach(Response.data.error.errors, function (error, key) {
                            errors += '\n- ' + error + '\n';
                        });
                        swal(Response.data.error.user_msg, errors, "error")
                    } else {
                        swal("Error", "Ocurrió un error en el servidor", "error");
                    }
                },
                BeforeSend: function () {
                    vm.flags.isUpdating = true;
                    bsLoadingOverlayService.stop();
                }
            });

        };

        vm.changeRoleStatus = function (item) {
            if (vm.flags.isUpdating) {
                return;
            }
            var previousStatus = (item.status == 1 ? 0 : 1);
            //item.$changeStatus = true;

            RoleService.ChangeStatus(item.id, item, {
                OnSuccess: function (Response) {
                    vm.flags.isUpdating = false;
                    bsLoadingOverlayService.stop();
                },
                OnError: function (Response) {
                    vm.flags.isUpdating = false;
                    bsLoadingOverlayService.stop();
                    var data = Response.data;
                    item.status = previousStatus;
                    if (Response.status == 401) {
                        swal("Error", "No tiene permisos para realizar esta acción", "error");
                    } else if (angular.isUndefined(data.error)) {
                        swal("Error", "Ocurrió un error en el servidor", "error");
                    } else if (Response.status == 406 || Response.status == 422) {
                        var errors = '';
                        angular.forEach(Response.data.error.errors, function (error, key) {
                            errors += '\n- ' + error + '\n';
                        });
                        swal(Response.data.error.user_msg, errors, "error")
                    } else {
                        swal("Error", "Ocurrió un error en el servidor", "error");
                    }
                },
                BeforeSend: function () {
                    vm.flags.isUpdating = true;
                    bsLoadingOverlayService.start();
                }
            });
        };

        //inicia un nuevo rol para poder crear
        function initNewRole() {
            vm.role = {status: 1, name: ""};
            vm.roleError = null;
        }

        function initTableRoles() {
            vm.tableRoles = new ngTableParams({
                page: 1,// show first page
                count: 10// count per page
            }, {
                total: vm.rolesList.length, // length of data
                getData: function ($defer, params) {
                    var orderedData = params.filter() ? $filter('filter')(vm.rolesList, params.filter()) : vm.rolesList;

                    this.name = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());

                    params.total(orderedData.length); // set total for recalc pagination
                    $defer.resolve(this.name);
                    //$defer.resolve(vm.rolesList.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                }
            });
        }

        //------------------------------------
        // INIT
        //------------------------------------

        function init() {
            initNewRole();
            vm.listarRoles();
        }

        init();

    })
    //----------------------------------------------
    // CREAR MICROPORTALES
    //----------------------------------------------
    .controller('RolesPrivilegesController', function (RoleService, bsLoadingOverlayService, $stateParams) {

        var vm = this;
        vm.role_id = $stateParams.id;
        vm.role = {};

        vm.checkAllPrivilegesChildren = function (item, parent) {
            if (parent != null) {
                if (parent.checkeable && parent.checked == 0 && item.checked == 1) {
                    parent.checked = 1;
                } else {
                    var count = 0;
                    angular.forEach(parent.children, function (child) {
                        count += child.checked;
                    });

                    if (count == 0) {
                        parent.checked = 0;
                    }
                }
            }
            angular.forEach(item.children, function (child) {
                child.checked = item.checked;
            });
        };

        vm.saveChanges = function () {
            RoleService.SavePrivileges(vm.role_id, vm.privileges, {
                BeforeSend: function () {
                    bsLoadingOverlayService.start();
                },
                OnSuccess: function (Response) {
                    bsLoadingOverlayService.stop();
                    //AclService.setAbilities(Response.data.data.acl);
                    messageAlert("Se actualizaron los privilegios.", '', 'success');
                },
                OnError: function (Response) {
                    bsLoadingOverlayService.stop();
                    var data = Response.data;
                    if (Response.status == 401) {
                        swal("Error", "No tiene permisos para realizar esta acción", "error");
                    } else if (angular.isUndefined(data.error)) {
                        swal("Error", "Ocurrió un error en el servidor", "error");
                    } else if (Response.status == 406 || Response.status == 422) {
                        var errors = '';
                        angular.forEach(Response.data.error.errors, function (error, key) {
                            errors += '\n- ' + error + '\n';
                        });
                        swal(Response.data.error.user_msg, errors, "error")
                    } else {
                        swal("Error", "Ocurrió un error en el servidor", "error");
                    }
                }
            });
        };

        function loadPrivileges() {
            RoleService.GetPrivileges(vm.role_id, {
                BeforeSend: function () {
                    bsLoadingOverlayService.start();
                },
                OnSuccess: function (Response) {
                    bsLoadingOverlayService.stop();
                    vm.privileges = Response.data.data.privileges;
                    vm.role = Response.data.data.role;
                },
                OnError: function (Response) {
                    bsLoadingOverlayService.stop();
                }
            });
        }

        //------------------------------------
        // INIT
        //------------------------------------

        function init() {
            loadPrivileges();
        }

        init();
    });