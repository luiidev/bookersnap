/**
 * Created by BS on 12/08/2016.
 */
angular.module('microsite.controller', ['bsLoadingOverlay', 'daterangepicker', 'ngMap'])
    .run(function (bsLoadingOverlayService) {
        bsLoadingOverlayService.setGlobalConfig({
            delay: 0, // Minimal delay to hide loading overlay in ms.
            activeClass: undefined, // Class that is added to the element where bs-loading-overlay is applied when the overlay is active.
            templateUrl: 'overlay-template.html', // Template url for overlay element. If not specified - no overlay element is created.
            templateOptions: undefined // Options that are passed to overlay template (specified by templateUrl option above).
        });
    })
    //----------------------------------------------
    // LISTA MICROSITIOS
    //----------------------------------------------
    .controller('MicrositeListController', function (MicrositeService, bsLoadingOverlayService) {
        var vm = this;
        vm.flagDateTimeChange = 0;
        vm.orderVisits = 'desc';
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

        vm.urlImgMs = '/files/microsites/image/80x80/';
        vm.urlImgCategory = '/files/categories/image/80x80/';

        vm.listarMicrositios = function () {
            var data = buildData();
            MicrositeService.GetPage(data, {
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
            vm.listarMicrositios();
        };

        vm.changePage = function () {
            vm.listarMicrositios();
        };

        vm.orderByVisit = function () {
            if (!vm.flags.isLoading) {
                if (vm.orderVisits == 'desc') {
                    vm.orderVisits = 'asc';
                } else {
                    vm.orderVisits = 'desc';
                }
                vm.pagination.page = 1;

                if (vm.flagDateTimeChange == 0) {
                    setCurrentDateTomorrow();
                }

                vm.listarMicrositios();
            }
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
            if (vm.flagDateTimeChange == 0) {
                setCurrentDateTomorrow();
            }
            data.dateRange = vm.count_filter_selected;
            data.orderVisits = vm.orderVisits;
            return data;
        }

        function init_dates() {
            vm.dates = {};
            vm.dates.origin_date = new Date(2015, 1, 1);
            vm.dates.current_date = new Date();
            vm.dates.current_time = vm.dates.current_date.getTime();
            vm.dates.current_dayweek = vm.dates.current_date.getDay();
            vm.dates.current_year = vm.dates.current_date.getFullYear();
            vm.dates.current_month = vm.dates.current_date.getMonth();
            vm.dates.current_day = vm.dates.current_date.getDate();
            vm.dates.dayWeekIni_time = vm.dates.current_time - (vm.dates.current_dayweek) * 24 * 3600000;
            vm.dates.dayWeekIni_date = new Date(vm.dates.dayWeekIni_time);
            vm.dates.last7day_time = vm.dates.current_time - 6 * 24 * 3600000;
            vm.dates.last7day_date = new Date(vm.dates.last7day_time);
            vm.dates.last30day_time = vm.dates.current_time - 30 * 24 * 3600000;
            vm.dates.last30day_date = new Date(vm.dates.last30day_time);
            vm.dates.dayMontIni_date = new Date(vm.dates.current_year, vm.dates.current_month, 1);
            vm.dates.dayMontIni_time = vm.dates.dayMontIni_date.getTime();
            vm.dates.lastMont_timeend = vm.dates.dayMontIni_time - 1 * 24 * 3600000;
            vm.dates.lastMont_dateend = new Date(vm.dates.lastMont_timeend);
            if (vm.dates.current_month > 0) {
                vm.dates.lastMont_date = new Date(vm.dates.current_year, vm.dates.current_month - 1, 1);
            } else {
                vm.dates.lastMont_date = new Date(vm.dates.current_year - 1, 12, 1);
            }
            var aux = new Date();
            setCurrentDateTomorrow();

            vm.datepickerOptions = {
                'opens': 'left',
                'showDropdowns': true,
                'autoApply': true,
                'ranges': {
                    'Hoy': [vm.dates.current_date, vm.dates.current_date],
                    'Esta semana': [vm.dates.dayWeekIni_date, vm.dates.current_date],
                    'Ultimos 7 dias': [vm.dates.last7day_date, vm.dates.current_date],
                    'Ultimos 30 dias': [vm.dates.last30day_date, vm.dates.current_date],
                    'Este mes': [vm.dates.dayMontIni_date, vm.dates.current_date],
                    'Mes pasado': [vm.dates.lastMont_date, vm.dates.lastMont_dateend],
                    'Origen del tiempo': [vm.dates.origin_date, vm.dates.current_date]
                },
                'locale': {
                    'format': 'DD/MM/YYYY',
                    'separator': ' - ',
                    'applyLabel': 'aplicar',
                    'cancelLabel': 'cancel',
                    'fromLabel': 'Desde',
                    'toLabel': 'Hasta',
                    'customRangeLabel': 'Rango de fechas',
                    'daysOfWeek': [
                        'Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'
                    ],
                    'monthNames': [
                        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
                    ],
                    'firstDay': 1
                },
                'startDate': vm.dates.dayWeekIni_date,
                'endDate': vm.dates.current_date,
                'minDate': vm.dates.origin_date,
                'maxDate': vm.dates.current_date - 24 * 3600000,
                eventHandlers: {
                    'apply.daterangepicker': function (ev, picker) {
                        if (vm.flagDateTimeChange == 0) {
                            vm.flagDateTimeChange = 1;
                        }
                        vm.listarMicrositios();
                        //pendiente para integracion con node js
                        //fn_loadMicrositeCounters();
                    }
                }
            };

            var isSameDay = function (date, otherDate) {
                return date.toDateString() === otherDate.toDateString();
            };
        }

        function fn_loadMicrositeCounters() {
            if (vm.flagDateTimeChange == 0) {
                setCurrentDateTomorrow();
            }
            Ajax.Req("post", "/ajax/ms-microsite/counters", {count_range: vm.count_filter_selected}, vm.micrositeCounterListener);

            if (vm.flagDateTimeChange == 0) {
                setCurrentDateDefault();
            }
        }

        //------------------------------------
        // FIX PARA ANGULAR DATE RANGE PICKER
        //------------------------------------
        function setCurrentDateTomorrow() {
            var aux = new Date();
            vm.count_filter_selected = {
                startDate: vm.dates.dayWeekIni_date,
                endDate: new Date(new Date().setDate(aux.getDate() + 1))
            };

        }

        function setCurrentDateDefault() {
            vm.count_filter_selected = {
                startDate: vm.dates.dayWeekIni_date,
                endDate: vm.dates.current_date
            };
        }

        //------------------------------------
        // INIT
        //------------------------------------

        function init() {
            init_dates();
            vm.listarMicrositios();
        }

        init();

    })
    //----------------------------------------------
    // CREAR MICROSITIOS
    //----------------------------------------------
    .controller('MicrositeCreateController', function (MicrositeService, bsLoadingOverlayService, Modal, NgMap, EventListener, $state) {
        var vm = this;
        vm.microsite = {
            ms_type: 1,
            site_name: '',
            categories: [{bs_category_id: null, bs_subcategory_id: null}],
            scores: [],
            localServices: [],
            bsServices: []
        };
        vm.startPosition = {lat: -12.142553, lng: -76.99104790000001};
        vm.countries = [];
        vm.categories = [];
        vm.subcategories = [];
        vm.classBtnAvailableSitename = "btn-default";
        vm.sitenameIcon = 'zmdi-refresh';

        vm.updateCities = function () {
            MicrositeService.GetCities(vm.microsite.bs_country_id, {
                BeforeSend: function () {

                },
                OnSuccess: function (Response) {
                    vm.cities = Response.data.data;
                },
                OnError: function (Response) {

                }
            });
        };

        vm.updateSubCategories = function ($index) {
            if (vm.microsite.categories[$index].bs_category_id == null) {
                vm.subcategories[$index] = [];
                return false;
            }
            if (countCategorySelected(vm.microsite.categories[$index].bs_category_id) > 1) {
                vm.microsite.categories[$index].bs_category_id = null;
                vm.subcategories[$index] = [];
                return false;
            }
            GetSubcategories($index);

        };

        vm.addCategory = function () {
            vm.microsite.categories.push({bs_category_id: null, bs_subcategory_id: null});
        };

        vm.editScores = function () {
            Modal.Open('', 'editScores.html',
                function (data, $uibModalInstance) {
                    var vm = this;
                    vm.scores = data.scores;
                    vm.close = function () {
                        $uibModalInstance.dismiss('cancel');
                    }
                }, {scores: vm.microsite.scores});
        };

        vm.editLocalServices = function () {
            Modal.Open('', 'editLocalServices.html',
                function (data, $uibModalInstance) {
                    var vm = this;
                    vm.services = data.services;
                    vm.close = function () {
                        $uibModalInstance.dismiss('cancel');
                    }
                }, {services: vm.microsite.localServices});
        };

        vm.editBsServices = function () {
            Modal.Open('', 'editBsServices.html',
                function (data, $uibModalInstance) {
                    var vm = this;
                    vm.services = data.services;
                    vm.close = function () {
                        $uibModalInstance.dismiss('cancel');
                    }
                }, {services: vm.microsite.bsServices});
        };

        vm.verifySitenameDisp = function () {
            if (vm.microsite.site_name.trim() == '') {
                return;
            }
            var $free = false;
            if (vm.microsite.ms_type == 2 || vm.microsite.ms_type == 3) {
                $free = true;
            }
            MicrositeService.CheckSitename(vm.microsite.site_name, $free, {
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
                                $suggestions += '\n- ' + sugg.sitename;
                            });
                            swal('No Disponible. Intenta con estos nombres:', $suggestions, 'error');
                        } else if (Response.status == 403 || Response.status == 401) {
                            swal('Acceso denegado', null, "error")
                        } else {
                            swal('Error', Response.data.error.user_msg, 'error');
                        }
                    } catch ($e) {
                        swal('Error', 'Ocurrió un error en el servidor', 'error');
                    }
                }
            });
        };

        vm.register = function () {
            UpdateMapCoordinates();
            UpdateMicrositeType();
            MicrositeService.SaveMicrosite(vm.microsite, {
                BeforeSend: function () {
                    bsLoadingOverlayService.start();
                },
                OnSuccess: function (Response) {
                    bsLoadingOverlayService.stop();
                    try {
                        var data = Response.data;
                        if (data.success) {
                            messageAlert('Micrositio creado.', '', 'success');
                            $state.go('microsite-list');
                        }
                    } catch ($e) {
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
                        } else if (Response.status == 403 || Response.status == 401) {
                            swal('Acceso denegado', null, "error")
                        } else {
                            swal("Error", data.error.user_msg, "error")
                        }
                    } catch ($e) {
                        swal("Error", "Ocurrió un error en el servidor", "error");
                    }
                }
            });
        };

        vm.removeCategory = function (item) {
            if (vm.microsite.categories.length > 1) {
                vm.microsite.categories.splice(vm.microsite.categories.indexOf(item), 1);
            }
        };

        function GetCountries() {
            MicrositeService.GetCountries({
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
            MicrositeService.GetCategories({
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
            MicrositeService.GetSubcategories(vm.microsite.categories[index].bs_category_id, {
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
            MicrositeService.GetScores({
                BeforeSend: function () {

                },
                OnSuccess: function (Response) {
                    vm.microsite.scores = Response.data.data;
                },
                OnError: function (Response) {
                }
            });
        }

        function GetLocalServices() {
            MicrositeService.GetLocalServices({
                BeforeSend: function () {

                },
                OnSuccess: function (Response) {
                    vm.microsite.localServices = Response.data.data;
                },
                OnError: function (Response) {
                }
            });
        }

        function GetBsServices() {
            MicrositeService.GetBsServices({
                BeforeSend: function () {

                },
                OnSuccess: function (Response) {
                    vm.microsite.bsServices = Response.data.data;
                },
                OnError: function (Response) {
                }
            });
        }

        function countCategorySelected(id) {
            var count = 0;
            for (var i in vm.microsite.categories) {
                if (vm.microsite.categories[i].bs_category_id == id) {
                    count++;
                }
            }
            return count;
        }

        function initializeMap() {
            vm.map = new google.maps.Map(document.getElementById('map'), {
                zoom: 16,
                center: vm.startPosition
            });
            var input = document.getElementById('searchbox')
            var searchBox = new google.maps.places.SearchBox(input);
            vm.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
            vm.marker = fn_getMarker(vm.startPosition, '');
            searchBox.addListener('places_changed', fn_placeChanged);
        }

        function fn_getMarker(position, title) {
            return new google.maps.Marker({
                map: vm.map,
                draggable: true,
                title: title,
                animation: google.maps.Animation.BOUNCE,
                position: position
            });
        }

        function fn_placeChanged() {
            var places = this.getPlaces();
            // if (places.length == 0) {
            //     return;
            // }
            var bounds = new google.maps.LatLngBounds();
            var firstPlace = false;
            for (var i = 0, place; place = places[i]; i++) {
                if (firstPlace) {
                    break;
                }
                if (vm.marker) {
                    vm.marker.setMap(null);
                }
                vm.marker = fn_getMarker(place.geometry.location, place.name);
                //console.log(vm.marker);
                if (place.geometry.viewport) {
                    bounds.union(place.geometry.viewport);
                } else {
                    bounds.extend(place.geometry.location);
                }
                firstPlace = true;
            }
            vm.map.setCenter(vm.marker.getPosition());
            vm.map.setZoom(16);

        }

        function OnChangeState() {
            EventListener.receive('$stateChangeStart', function () {
                if (vm.marker) {
                    vm.marker.setMap(null);
                }
            });
        }

        function LoadMap() {
            if (vm.marker) {
                vm.marker.setMap(null);
            }
            NgMap.getMap().then(function (map) {
                vm.map = map;
                vm.map.setCenter(vm.startPosition);
                var input = document.getElementById('searchbox');
                var searchBox = new google.maps.places.SearchBox(input);
                vm.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
                vm.marker = fn_getMarker(vm.startPosition, '');
                searchBox.addListener('places_changed', fn_placeChanged);
            });
        }

        function UpdateMicrositeType() {

            switch (vm.microsite.ms_type) {
                case 1:
                    vm.microsite.free = false;
                    vm.microsite.status_claimed = 1;
                    break;
                case 2:
                    vm.microsite.free = true;
                    vm.microsite.status_claimed = 0;
                    break;
                case 3:
                    vm.microsite.free = true;
                    vm.microsite.status_claimed = 1;
                    break;
            }
        }

        function UpdateMapCoordinates() {
            vm.microsite.map_latitude = vm.marker.position.lat();
            vm.microsite.map_longitude = vm.marker.position.lng();
        }

        function init() {
            google.maps.event.addDomListener(window, 'load', initializeMap);
            GetCountries();
            GetCategories();
            GetScores();
            GetLocalServices();
            GetBsServices();
            LoadMap();
            OnChangeState();
        }

        init();
    })