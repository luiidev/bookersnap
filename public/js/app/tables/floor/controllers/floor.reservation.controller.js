angular.module('floor.controller')
    .controller('reservationController', function($scope, $rootScope, $uibModal, $timeout, FloorFactory, ServerDataFactory,
        TypeFilterDataFactory, FloorDataFactory, global, reservationService) {
        var rm = this;

        rm.visits = {};
        rm.typeRes = {};
        rm.filter_status = [1, 2, 3];
        rm.filter_people = [];
        rm.filter_reserva = [];
        rm.filter_type = [];
        rm.zonesNumber = [];

        rm.fecha_actual = getFechaActual();
        var validaModal = false; //modal editar reservacion
        rm.search = {
            show: true
        };

        rm.searchReservation = function() {
            rm.search.show = !rm.search.show;
            rm.busqueda = "";
        };

        rm.categorias_people = [{
            id: 1,
            name: 'Todos',
            checked: true,
        }, {
            id: 2,
            name: 'Hombres',
            filter: "men",
            checked: false,
        }, {
            id: 3,
            name: 'Mujeres',
            filter: "woman",
            checked: false,
        }, {
            id: 4,
            name: 'Niños',
            filter: "children",
            checked: false,
        }];

        var statistics = function() {

            var total = 0;
            var men = 0;
            var women = 0;
            var children = 0;
            var tWeb = 0;
            var tTel = 0;
            var tPor = 0;
            var tRp = 0;

            angular.forEach(rm.res_listado.data, function(reservation, index) {
                men += reservation.num_people_1;
                women += reservation.num_people_2;
                children += reservation.num_people_3;
                total += reservation.num_guest;

                var source_type = reservation.res_source_type_id;
                switch (source_type) {
                    case 1:
                        tRp += 1;
                        break;
                    case 2:
                        tPor += 1;
                        break;
                    case 3:
                        tTel += 1;
                        break;
                    case 4:
                        tWeb += 1;
                        break;
                }
            });

            rm.visits.men = men;
            rm.visits.woman = women;
            rm.visits.children = children;
            rm.visits.total_people = men + women + children;
            rm.total_visitas = rm.visits.total_people;
            visitsQuantity();

            rm.typeRes.WEB = tWeb;
            rm.typeRes.TELÉFONO = tTel;
            rm.typeRes.PORTAL = tPor;
            rm.typeRes.RP = tRp;
            rm.typeRes.total_reservas = tWeb + tTel + tPor + tRp;
            rm.total_reservas = rm.typeRes.total_reservas;

            // FloorFactory.getBlocksForReservation().then(function(response) {
            // FloorFactory.mergeBlockToReservation(response);
            //asignar servicio de reservaciones
            //console.log("blockReservation: " + angular.toJson(response, true));
            // });
        };

        rm.getZone = function(reservation) {
            if (global.lienzo.data.getZoneForTables) {
                return global.lienzo.data.getZoneForTables(reservation.tables);
            }
        };

        var customSelect = function(categoria, event, collection, filter, index_all, callback) {
            event.stopPropagation();

            if (categoria.id === index_all) {
                filter.length = 0;
                clear_select(collection);
            } else {
                var index = filter.indexOf(categoria);
                if (index === -1) {
                    filter.push(categoria);
                    categoria.checked = true;

                    collection[0].checked = false;
                } else {
                    filter.splice(index, 1);
                    categoria.checked = false;

                    if (filter.length === 0) {
                        collection[0].checked = true;
                    }
                }
            }

            if (callback) callback();
        };

        rm.select_genders = function(categoria, event) {
            customSelect(categoria, event, rm.categorias_people, rm.filter_people, 1, visitsQuantity);
        };

        rm.select_type = function(categoria, event) {
            customSelect(categoria, event, rm.categorias_type, rm.filter_type, 0);
        };

        rm.select_reserva = function(categoria, event) {
            customSelect(categoria, event, rm.categorias_reserva, rm.filter_reserva, 0, reservaQuantity);
        };

        var clear_select = function(categories) {
            angular.forEach(categories, function(categoria) {
                categoria.checked = false;
            });

            categories[0].checked = true;
        };

        var visitsQuantity = function() {
            if (rm.categorias_people[0].checked === true) {
                rm.total_visitas = rm.visits.total_people;
            } else {
                rm.total_visitas = 0;
                angular.forEach(rm.categorias_people, function(categoria) {
                    if (categoria.id !== 1 && categoria.checked === true) {
                        rm.total_visitas += rm.visits[categoria.filter];
                    }
                });
            }
        };

        var reservaQuantity = function() {
            if (rm.categorias_reserva[0].checked === true) {
                rm.total_reservas = rm.typeRes.total_reservas;
            } else {
                rm.total_reservas = 0;
                angular.forEach(rm.categorias_reserva, function(categoria) {
                    if (categoria.id !== 0 && categoria.checked === true) {
                        rm.total_reservas += rm.typeRes[categoria.name];
                    }
                });
            }
        };

        rm.selectReservation = function(reservation) {
            $scope.$apply(function() {
                $rootScope.$broadcast("floorEventEstablish", "sit", reservation);
                $rootScope.$broadcast("floorTablesSelected", reservation.tables);
                $rootScope.$broadcast("floorZoneIndexSelected", reservation.tables);
            });
        };

        rm.clearSelected = function() {
            $scope.$apply(function() {
                $rootScope.$broadcast("floorClearSelected");
            });
        };

        rm.editReservation = function(reservation) {
            if (validaModal === true) {
                return;
            }

            var modalInstance = $uibModal.open({
                templateUrl: 'ModalEditReservation.html',
                controller: 'editReservationCtrl',
                controllerAs: 'er',
                size: '',
                resolve: {
                    content: function() {
                        return {
                            reservation: reservation
                        };
                    }
                }
            });

        };

        // rm.infoReservationShow = function() {
        //     var icon = true;
        //     console.log('sd');
        // };

        rm.mailReservationShow = function(reservation) {
            rm.disabledModal();
            var modalMailReservation = $uibModal.open({
                animation: true,
                templateUrl: 'myModalMailReservation.html',
                size: 'md',
                //keyboard: false,
                controller: 'ModalMailReservationCtrl',
                controllerAs: 'vm',
                resolve: {
                    reservation: function() {
                        return reservation;
                    }
                }
            });
        };

        rm.disabledModal = function() {
            validaModal = true;
            console.log("disabledModal");
            $timeout(function() {
                validaModal = false;
            }, 600);
        };

        var listTypeTurns = function() {
            FloorFactory.listTurnosActivos(rm.fecha_actual).then(function success(response) {
                    TypeFilterDataFactory.setTypeTurnItems(response);
                    rm.categorias_type = TypeFilterDataFactory.getTypeTurnItems();
                },
                function error(error) {
                    message.apiError(error);
                }
            );
        };

        var listSourceTypes = function() {
            FloorDataFactory.getSourceTypes().then(function success(response) {
                TypeFilterDataFactory.setSourceTypesItems(response.data.data);
                rm.categorias_reserva = TypeFilterDataFactory.getSourceTypesItems();
            }, function error(error) {
                message.apiError(error);
            });
        };

        var loadConfiguration = function() {
            FloorFactory.getConfiguracionPeople().then(function(response) {
                rm.configuracion = {
                    status_people_1: response.status_people_1,
                    status_people_2: response.status_people_2,
                    status_people_3: response.status_people_3,
                };
            });
        };

        var clearState = function() {
            $rootScope.$broadcast("floorClearSelected");
            angular.element('.bg-window-floor').removeClass('drag-dispel');
            FloorFactory.isEditServer(false);
        };

        (function Init() {
            clearState();

            rm.res_listado = global.reservations;
            $scope.$watch("rm.res_listado", statistics, true);

            loadConfiguration();
            listSourceTypes();
            listTypeTurns();
        })();
    })
    .controller("editReservationCtrl", ["$rootScope", "$state", "$uibModalInstance", "content", "reservationService", "$q",
        function($rootScope, $state, $uibModalInstance, content, service, $q) {

            var er = this;

            /**
             * Tags de reservacion
             * @type {Array}
             */
            er.tags = [];

            /**
             * Tags de reservacion seleccionados
             * @type {Object}
             */
            er.selectTags = {};

            er.sumar = function(guest) {
                er.reservation.guests[guest]++;
                totalGuests();
            };

            er.restar = function(guest) {
                var quantity = er.reservation.guests[guest];
                if (quantity - 1 >= 0) {
                    er.reservation.guests[guest]--;
                    totalGuests();
                }
            };

            var totalGuests = function() {
                er.reservation.guests.total = er.reservation.guests.men + er.reservation.guests.women + er.reservation.guests.children;
            };

            function parseData(reservation) {
                var men = 0;
                var women = 0;
                var children = 0;
                if (er.configuration.status_people_1) {
                    men = reservation.num_people_1 || 0;
                }
                if (er.configuration.status_people_2) {
                    women = reservation.num_people_2 || 0;
                }
                if (er.configuration.status_people_3) {
                    children = reservation.num_people_3 || 0;
                }
                er.reservation = {
                    id: reservation.id,
                    covers: reservation.num_guest,
                    status_id: reservation.res_reservation_status_id,
                    server_id: reservation.res_server_id,
                    note: reservation.note || null,
                    guests: {
                        men: men,
                        women: women,
                        children: children
                    }
                };

                totalGuests();
            }

            function parseInfo(reservation) {
                er.info = {
                    first_name: reservation.guest ? reservation.guest.first_name : "Reservacion sin nombre.",
                    last_name: reservation.guest ? reservation.guest.last_name : "",
                    date: moment(reservation.date_reservation).format("dddd, d [de] MMMM"),
                    time: moment(reservation.hours_reservation, "HH:mm:ss").format("H:mm A"),
                    tables: getTables(reservation.tables)
                };
            }

            function getTables(tables) {
                var reservationTables = "";
                angular.forEach(tables, function(table) {
                    reservationTables += table.name + ", ";
                });

                return reservationTables.substring(0, reservationTables.length - 2);
            }

            var listGuest = function() {
                var deferred = $q.defer();
                service.getGuest()
                    .then(function(guests) {
                        er.covers = guests;
                    }).catch(function(error) {
                        message.apiError(error);
                    }).finally(function() {
                        deferred.resolve();
                    });

                return deferred.promise;
            };

            var listStatuses = function() {
                var deferred = $q.defer();
                service.getStatuses()
                    .then(function(response) {
                        er.statuses = response.data.data;
                    }).catch(function(error) {
                        message.apiError(error);
                    }).finally(function() {
                        deferred.resolve();
                    });

                return deferred.promise;
            };

            var listServers = function() {
                var deferred = $q.defer();
                service.getServers()
                    .then(function(response) {
                        er.servers = response.data.data;
                    }).catch(function(error) {
                        message.apiError(error);
                    }).finally(function() {
                        deferred.resolve();
                    });

                return deferred.promise;
            };

            var listReservationTags = function() {
                var deferred = $q.defer();

                service.getReservationTags()
                    .then(function(response) {
                        er.tags = response.data.data;
                    }).catch(function(error) {
                        message.apiError(error);
                    }).finally(function() {
                        deferred.resolve();
                    });

                return deferred.promise;
            };

            var loadConfiguration = function() {
                var deferred = $q.defer();
                service.getConfigurationRes()
                    .then(function(response) {
                        er.configuration = response.data.data;
                    }).catch(function(error) {
                        message.apiError(error);
                    }).finally(function() {
                        deferred.resolve();
                    });

                return deferred.promise;
            };

            er.reservationEditAll = function() {
                $uibModalInstance.dismiss('cancel');
                $state.go('mesas.reservation-edit', {
                    id: er.reservation.id,
                    date: moment().format("YYYY-MM-DD")
                });
            };

            er.cancel = function() {
                $uibModalInstance.dismiss('cancel');
            };

            er.save = function() {
                var id = er.reservation.id;

                ///////////////////////////////////////////////////////////////
                // parse reservation.tags
                ///////////////////////////////////////////////////////////////
                er.reservation.tags = [];
                er.reservation.tags = Object.keys(er.selectTags).reduce(function(result, value) {
                    result.push(parseInt(value));
                    return result;
                }, []);

                service.blackList.key(er.reservation);

                service.quickEdit(id, er.reservation)
                    .then(function(response) {
                        $rootScope.$broadcast("floorReload", response.data.data, "update");
                        message.success(response.data.msg);
                        $uibModalInstance.dismiss('cancel');
                    }).catch(function(error) {
                        message.apiError(error);
                    });
            };

            er.cancelReservation = function() {
                message.confirm("¿ Esta seguro de cencelar la reservacion ?", "Esta accion se puede revertir", function() {
                    er.waitingResponse = true;
                    var id = er.reservation.id;

                    service.blackList.key();

                    service.cancel(id, {
                            key: key
                        })
                        .then(function(response) {
                            $rootScope.$broadcast("floorReload", response.data.data, "update");
                            message.success(response.data.msg);
                            $uibModalInstance.dismiss('cancel');
                            er.waitingResponse = false;
                        }).catch(function(error) {
                            message.apiError(error);
                            er.waitingResponse = false;
                        });
                });
            };

            function listResource() {
                return $q.all([
                    listGuest(),
                    listStatuses(),
                    listServers(),
                    loadConfiguration(),
                    listReservationTags()
                ]);
            }

            /**
             * Select tags
             */
            er.addTag = function(tag) {
                tag.checked = !tag.checked;
                listTagsSelected();
            };

            var listTagsSelected = function() {
                angular.forEach(er.tags, function(tag) {
                    if (tag.checked) {
                        er.selectTags[tag.id] = angular.copy(tag);
                    } else {
                        delete er.selectTags[tag.id];
                    }
                });
            };

            var paintTags = function(tags) {
                angular.forEach(tags, function(tagInUse) {
                    angular.forEach(er.tags, function(tag) {
                        if (tag.id == tagInUse.id) {
                            tag.checked = true;
                        }
                    });
                });

                listTagsSelected();
            };

            var resetTags = function() {
                er.selectTags = {};
                angular.forEach(er.tags, function(tag) {
                    tag.checked = false;
                });
            };
            /**
             * END Select tags
             */

            (function Init() {
                var date = getFechaActual();

                if (content.reservation.block_id) $state.go("mesas.floor.block", {
                    date: date,
                    id: content.reservation.block_id
                });

                listResource().then(function() {
                    resetTags();
                    parseInfo(content.reservation);
                    parseData(content.reservation);
                    paintTags(content.reservation.tags);
                });
                console.log(content.reservation);
            })();
        }
    ])
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
            // console.log(angular.toJson(reservation, true));
            vm.reservation.date = reservation.date_reservation;
            vm.reservation.time = reservation.hours_reservation;
            vm.reservation.email = reservation.email;
            var first_name = reservation.guest ? reservation.guest.first_name : "Reservacion sin nombre";
            var last_name = reservation.guest ? reservation.guest.last_name : "";
            vm.reservation.nombre = first_name + " - " + last_name;
            vm.reservation.note = reservation.note;
        };

        vm.sendMail = function() {
            FloorDataFactory.sendMessage(reservation.id, vm.mailData).then(
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
    });