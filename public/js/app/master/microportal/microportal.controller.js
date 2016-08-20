/**
 * Created by BS on 12/08/2016.
 */
angular.module('microportal.controller', ['bsLoadingOverlay'])
    .run(function (bsLoadingOverlayService) {
        bsLoadingOverlayService.setGlobalConfig({
            delay: 0, // Minimal delay to hide loading overlay in ms.
            activeClass: undefined, // Class that is added to the element where bs-loading-overlay is applied when the overlay is active.
            templateUrl: 'overlay-template.html', // Template url for overlay element. If not specified - no overlay element is created.
            templateOptions: undefined // Options that are passed to overlay template (specified by templateUrl option above).
        });
    })
    //----------------------------------------------
    // LISTAR MICROPORTALES
    //----------------------------------------------
    .controller('MicroportalListController', function (MicroportalService, bsLoadingOverlayService) {
        var vm = this;
        vm.pagination = {
            page: 1,
            page_size: 5,
            total: 0,
            items: []
        };

        vm.flags = {
            serverError: false,
            isLoading: false
        };

        vm.filters = {
            name: "",
            domain: "",
            category: "",
            subcategory: ""
        };

        vm.urlImgMp = '/files/microportals/image/80x80/';
        vm.urlImgCategory = '/files/categories/image/80x80/';

        vm.listarMicroportales = function () {
            var data = buildData();
            MicroportalService.GetPage(data, {
                BeforeSend: function () {
                    vm.flags.isLoading = true;
                    bsLoadingOverlayService.start();
                },
                OnSuccess: function (Response) {
                    vm.flags.isLoading = false;
                    bsLoadingOverlayService.stop();
                    var data = Response.data;
                    vm.pagination = data.data;
                },
                OnError: function (Response) {
                    vm.flags.isLoading = false;
                    bsLoadingOverlayService.stop();
                    swal('Error', 'Ocurrió un error en el servidor', 'error');
                }
            });
            if (vm.flagDateTimeChange == 0) {
                setCurrentDateDefault();
            }
        };

        vm.search = function () {
            vm.pagination.page = 1;
            vm.listarMicroportales();
        };

        vm.changePage = function () {
            vm.listarMicroportales();
        };

        function buildData() {
            var data = {
                page: vm.pagination.page,
                page_size: vm.pagination.page_size
            };
            if (vm.filters.name.trim().length > 0
                || vm.filters.domain.trim().length > 0
                || vm.filters.category.trim().length > 0
                || vm.filters.subcategory.trim().length > 0
            ) {
                data.filters = vm.filters;
            }

            return data;
        }

        //------------------------------------
        // INIT
        //------------------------------------

        function init() {
            vm.listarMicroportales();
        }

        init();

    })
    //----------------------------------------------
    // CREAR MICROPORTALES
    //----------------------------------------------
    .controller('MicroportalCreateController', function (MicroportalService, bsLoadingOverlayService, $state) {
        var vm = this;
        vm.microportal = {
            site_name: '',
            categories: [{bs_category_id: null, bs_subcategory_id: null}]
        };
        vm.countries = [];
        vm.categories = [];
        vm.subcategories = [];
        vm.classBtnAvailableSitename = "btn-default";
        vm.sitenameIcon = 'zmdi-refresh';

        vm.flags = {
            isProccessing: false
        };

        vm.updateCities = function () {
            MicroportalService.GetCities(vm.microportal.bs_country_id, {
                BeforeSend: function () {

                },
                OnSuccess: function (Response) {
                    vm.cities = Response.data.data;
                },
                OnError: function (Response) {

                }
            });
        };

        vm.OnCitySelected = function (item) {

            if (angular.isUndefined(item)) {
                vm.microportal.bs_city_id = null;
                return;
            }
            if (item.originalObject == null || item.originalObject == undefined) {
                vm.microportal.bs_city_id = null;
                return;
            }
            if (angular.isString(item.originalObject) && item.originalObject == "") {
                vm.microportal.bs_city_id = null;
                return;
            } else {
                vm.microportal.bs_city_id = item.originalObject.id;
            }
        };

        vm.updateSubCategories = function ($index) {
            if (vm.microportal.categories[$index].bs_category_id == null) {
                vm.subcategories[$index] = [];
                return false;
            }
            if (countCategorySelected(vm.microportal.categories[$index].bs_category_id) > 1) {
                vm.microportal.categories[$index].bs_category_id = null;
                vm.subcategories[$index] = [];
                return false;
            }
            GetSubcategories($index);

        };

        vm.addCategory = function () {
            vm.microportal.categories.push({bs_category_id: null, bs_subcategory_id: null});
        };

        vm.editScores = function () {
            Modal.Open('', 'editScores.html',
                function (data, $uibModalInstance) {
                    var vm = this;
                    vm.scores = data.scores;
                    vm.close = function () {
                        $uibModalInstance.dismiss('cancel');
                    }
                }, {scores: vm.microportal.scores});
        };

        vm.editLocalServices = function () {
            Modal.Open('', 'editLocalServices.html',
                function (data, $uibModalInstance) {
                    var vm = this;
                    vm.services = data.services;
                    vm.close = function () {
                        $uibModalInstance.dismiss('cancel');
                    }
                }, {services: vm.microportal.localServices});
        };

        vm.editBsServices = function () {
            Modal.Open('', 'editBsServices.html',
                function (data, $uibModalInstance) {
                    var vm = this;
                    vm.services = data.services;
                    vm.close = function () {
                        $uibModalInstance.dismiss('cancel');
                    }
                }, {services: vm.microportal.bsServices});
        };

        vm.verifySitenameDisp = function () {
            if (vm.microportal.site_name.trim() == '') {
                return;
            }
            MicroportalService.CheckSitename(vm.microportal.site_name, {
                BeforeSend: function () {

                },
                OnSuccess: function (Response) {
                    vm.classBtnAvailableSitename = "btn-success";
                    vm.sitenameIcon = 'zmdi-check';
                },
                OnError: function (Response) {
                    try {
                        vm.classBtnAvailableSitename = "btn-danger";
                        vm.sitenameIcon = 'zmdi-close';
                        if (Response.status == 406) {
                            var data = Response.data.data;
                            var $suggestions = '';
                            angular.forEach(data.suggestions, function (sugg) {
                                $suggestions += '\n-' + sugg.sitename;
                            });
                            swal('No Disponible. Intenta con estos nombres:', $suggestions, 'error');
                        } else {
                            swal('Error', Response.data.error.user_msg, 'error');
                        }
                    } catch ($e) {
                        swal('Error', 'Ocurrió un error en el servidor', 'error');
                    }
                }
            });
        };

        vm.removeCategory = function (item) {
            if (vm.microportal.categories.length > 1) {
                vm.microportal.categories.splice(vm.microportal.categories.indexOf(item), 1);
            }
        };

        vm.register = function () {
            MicroportalService.SaveMicroportal(vm.microportal, {
                BeforeSend: function () {
                    vm.flags.isProccessing = true;
                    bsLoadingOverlayService.start();
                },
                OnSuccess: function (Response) {
                    vm.flags.isProccessing = false;
                    bsLoadingOverlayService.stop();
                    try {
                        var data = Response.data;
                        if (data.success) {
                            messageAlert('Microportal creado.', '', 'success');
                            $state.go('microsite-list');
                        }
                    } catch ($e) {
                        swal("Error", "Ocurrió un error en el servidor", "error");
                    }
                },
                OnError: function (Response) {
                    vm.flags.isProccessing = false;
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
                }
            });
        };

        function GetCountries() {
            MicroportalService.GetCountries({
                BeforeSend: function () {

                },
                OnSuccess: function (Response) {
                    vm.countries = Response.data.data;
                },
                OnError: function (Response) {

                }
            });
        }

        function GetCategories() {
            MicroportalService.GetCategories({
                BeforeSend: function () {

                },
                OnSuccess: function (Response) {
                    vm.categories = Response.data.data;
                },
                OnError: function (Response) {
                }
            });
        }

        function GetSubcategories(index) {
            MicroportalService.GetSubcategories(vm.microportal.categories[index].bs_category_id, {
                BeforeSend: function () {

                },
                OnSuccess: function (Response) {
                    vm.subcategories[index] = Response.data.data;
                },
                OnError: function (Response) {

                }
            });
        }

        function GetScores() {
            MicroportalService.GetScores({
                BeforeSend: function () {

                },
                OnSuccess: function (Response) {
                    vm.microportal.scores = Response.data.data;
                },
                OnError: function (Response) {
                }
            });
        }

        function GetLocalServices() {
            MicroportalService.GetLocalServices({
                BeforeSend: function () {

                },
                OnSuccess: function (Response) {
                    vm.microportal.localServices = Response.data.data;
                },
                OnError: function (Response) {
                }
            });
        }

        function GetBsServices() {
            MicroportalService.GetBsServices({
                BeforeSend: function () {

                },
                OnSuccess: function (Response) {
                    vm.microportal.bsServices = Response.data.data;
                },
                OnError: function (Response) {
                }
            });
        }

        function countCategorySelected(id) {
            var count = 0;
            for (var i in vm.microportal.categories) {
                if (vm.microportal.categories[i].bs_category_id == id) {
                    count++;
                }
            }
            return count;
        }

        function init() {
            GetCountries();
            GetCategories();
            GetScores();
            GetLocalServices();
            GetBsServices();
        }

        init();
    })