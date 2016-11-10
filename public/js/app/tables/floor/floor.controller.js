angular.module('floor.controller', [])
    .controller('ModalMailReservationCtrl', function($uibModalInstance, reservation, FloorDataFactory) {
        var vm = this;

        vm.reservation = {
            date: '',
            time: '',
            email: '',
            nombre: ''
        };

        vm.mailData = {
            message: '',
            subject: ''
        };

        var init = function() {
            console.log(angular.toJson(reservation, true));
            vm.reservation.date = reservation.start_date;
            vm.reservation.time = reservation.start_time;
            vm.reservation.email = reservation.email;
            vm.reservation.nombre = reservation.first_name + " - " + reservation.last_name;
        };

        vm.sendMail = function() {
            FloorDataFactory.sendMessage(reservation.reservation_id, vm.mailData).then(
                function success(response) {
                    response = response.data;

                    messageAlert("Success", response.msg, "success", 2000, true);
                    $uibModalInstance.dismiss('cancel');

                    console.log("sendMail " + angular.toJson(response, true));
                },
                function error(response) {
                    message.apiError(response);
                    console.error("sendMail " + angular.toJson(response, true));
                });
        };

        vm.validateSendMail = function() {
            var valida = 0;

            if (vm.mailData.message === "") {
                alertMultiple("Alerta", "Ingrese un mensaje", "info", null);
                valida = 1;
            }

            if (vm.mailData.subject === "") {
                alertMultiple("Alerta", "Ingrese un asunto", "info", null);
                valida = 1;
            }

            if (valida === 0) {
                vm.sendMail();
            } else {
                $uibModalInstance.dismiss('cancel');
            }
        };

        vm.closeModal = function() {
            $uibModalInstance.dismiss('cancel');
        };

        init();
    })
    .controller('WaitListCtrl', function($rootScope, $scope, $uibModal, FloorFactory, ServerDataFactory, TypeFilterDataFactory) {

        var wm = this;

        wm.res_listado = [];
        wm.res_listado_canceled = [];

        wm.search = {
            show: true
        };

        $rootScope.$broadcast("floorClearSelected");

        wm.searchReservation = function() {
            wm.search.show = !wm.search.show;
        };

        wm.createWait = function(option, data) {
            var modalInstance = $uibModal.open({
                templateUrl: 'ModalCreateWaitList.html',
                controller: 'ModalWaitListCtrl',
                controllerAs: 'wl',
                size: '',
                resolve: {
                    option: function() {
                        return option;
                    },
                    data: function() {
                        return data;
                    }
                }
            });
        };

        wm.selectWaitlist = function(waitlist) {
            $scope.$apply(function() {
                $rootScope.$broadcast("floorEventEstablish", "sit", waitlist);
            });
        };

        var init = function() {

            //Limpiar data y estilos de servers
            FloorFactory.isEditServer(false);
            angular.element('.bg-window-floor').removeClass('drag-dispel');
            // angular.element('.table-zone').removeClass("selected-table");

            ServerDataFactory.cleanTableServerItems();

            getListWailList(false);
        };

        var getListWailList = function(reload) {
            FloorFactory.getWailList(reload).then(
                function success(response) {
                    wm.res_listado = response.actives;
                    wm.res_listado_canceled = response.canceled;
                    console.log("getListReservations " + angular.toJson(response, true));
                },
                function error(response) {
                    console.error("getListReservations " + angular.toJson(response, true));
                }
            );
        };

        var addWaitListNotification = function(dataWaitList) {

            var waitListData = FloorFactory.parseDataReservation(dataWaitList.data);
            waitListData = FloorFactory.setDataWaitList([waitListData]);

            switch (dataWaitList.action) {
                case "create":
                    $scope.$apply(function() {
                        wm.res_listado.push(waitListData.actives[0]);
                    });
                    break;
                case "update":
                    $scope.$apply(function() {
                        FloorFactory.updateWaitList(wm.res_listado, waitListData.actives[0]);
                    });
                    break;
                case "delete":
                    $scope.$apply(function() {
                        console.log("delete " + angular.toJson(waitListData, true));
                        FloorFactory.deleteWaitList(wm.res_listado, wm.res_listado_canceled, waitListData.canceled[0]);
                    });
                    break;
            }

        };

        $scope.$on("NotifyFloorWaitListReload", function(evt, data) {
            //console.log("Nueva lista de espera " + angular.toJson(data, true));
            addWaitListNotification(data);

            alertMultiple("Notificación: ", data.user_msg, "inverse", null, 'top', 'left', 10000, 20, 150);
        });

        init();
    })
    .controller("ModalWaitListCtrl", ["$rootScope", "$state", "$uibModalInstance", "reservationService", "$q", "$timeout", "option", "data", "FloorFactory",

        function($rootScope, $state, $uibModalInstance, service, $q, $timeout, option, data, FloorFactory) {

            var wl = this;
            var auxiliar;

            wl.reservation = {};
            wl.addGuest = true;
            wl.buttonText = 'Agregar a lista de espera';
            wl.title = "Nueva entrada";
            wl.option = option; //opcion del formulario : create | edit
            wl.covers = [];

            var listGuest = function() {
                var deferred = $q.defer();
                service.getGuest()
                    .then(function(guests) {
                        wl.covers = guests;
                        wl.reservation.covers = 2;
                    }).catch(function(error) {
                        message.apiError(error);
                    }).finally(function() {
                        deferred.resolve();
                    });

                return deferred.promise;
            };

            var listDurations = function() {
                var deferred = $q.defer();

                service.getDurations()
                    .then(function(durations) {
                        wl.durations = durations;
                        wl.reservation.quote = "00:15:00";
                    }).finally(function() {
                        deferred.resolve();
                    });

                return deferred.promise;
            };

            //Search guest list
            wl.searchGuest = function(name) {
                console.log(name);
                if (auxiliar) $timeout.cancel(auxiliar);
                if (name === "") {
                    wl.guestList = [];
                    return;
                }
                var search = function() {
                    service.getGuestList(name)
                        .then(function(response) {
                            wl.guestList = response.data.data.data;
                        }).catch(function(error) {
                            message.apiError(error);
                        });
                };

                auxiliar = $timeout(search, 500);
            };

            wl.selectGuest = function(guest) {
                wl.reservation.guest_id = guest.id;
                wl.guest = guest;
                wl.addGuest = false;
            };

            wl.removeGuest = function() {
                wl.reservation.guest_id = null;
                wl.newGuest = null;
                wl.guestList = [];
                wl.addGuest = true;
            };
            //End Search

            wl.cancel = function() {
                $uibModalInstance.dismiss('cancel');
            };

            wl.save = function() {
                if (!wl.reservation.guest_id) {
                    if (wl.newGuest) {
                        delete wl.reservation.guest_id;
                        wl.reservation.guest = wl.newGuest;
                    }
                } else {
                    delete wl.reservation.guest;
                }

                wl.reservation.guest = wl.newGuest;
                wl.buttonText = 'Enviando ...';

                FloorFactory.saveWaitList(wl.reservation, wl.option).then(
                    function success(response) {
                        wl.buttonText = 'Agregar a lista de espera';
                        message.success(response.data.msg);
                        $uibModalInstance.dismiss('cancel');
                    },
                    function error(response) {
                        wl.buttonText = 'Agregar a lista de espera';
                        console.error("saveWait " + angular.toJson(error, true));
                        message.apiError(error);
                    }
                );

            };

            wl.delete = function() {
                service.deleteWaitList(data.reservation_id).then(
                    function success(response) {
                        message.success(response.data.msg);
                        $uibModalInstance.dismiss('cancel');
                    },
                    function error(response) {
                        message.apiError(response.data);
                    });
            };

            var listResource = function() {
                return $q.all([listGuest(), listDurations()]);
            };

            var defineOption = function() {
                if (option === "edit") {

                    wl.reservation.id = data.reservation_id;
                    loadEditData();
                }
            };

            var loadEditData = function() {
                wl.title = "Editar entrada";

                if (data.guest !== null) {
                    wl.selectGuest(data.guest);
                }

                wl.reservation.covers = data.num_people;
                wl.reservation.quote = data.quote;
                wl.reservation.note = data.note;
            };

            var init = function() {
                listResource().then(
                    function success(response) {
                        defineOption();
                    },
                    function error(response) {
                        console.error("listResource" + angular.toJson(response, true));
                    }
                );

            };

            init();

        }
    ]);