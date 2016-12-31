angular.module('floor.controller')
    .controller('reservationController', function($scope, $rootScope, $uibModal, $interval, $timeout, FloorFactory, ServerDataFactory,
        TypeFilterDataFactory, FloorDataFactory, global, reservationService) {
        var rm = this;

        rm.visits = {};
        rm.typeRes = [];
        rm.filter_status = [1, 2, 3];
        rm.filter_people = [];
        rm.filter_reserva = [];
        rm.filter_type = [];
        rm.zonesNumber = [];
        rm.status = [];
        rm.servers = [];
        rm.tags = [];
        rm.schedule = {};

        var blocks = [];

        rm.res_listado = [];

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


        var inspectToleranceReservation = function(reservation) {
            if (rm.configuracion && reservation.status.id < 4) {
                var nowdate = moment();
                var horareservacion = moment(reservation.datetime_input);
                var diferece = horareservacion.diff(nowdate) / 60000; // DIFERENCIA EN MINUTOS

                var time_tolerance = rm.configuracion.time_tolerance;

                //console.log('reservation: ', reservation.id, ' reservation.datetime_input: ', reservation.datetime_input, ' diferece: ', diferece);

                if (diferece >= 0) {
                    reservation.class = 'success';
                } else {
                    if (-diferece < time_tolerance) {
                        reservation.class = 'warning';
                    } else {
                        reservation.class = 'danger';
                    }
                }
            }
        };

        var statistics = function(action) {
            var total = 0;
            var men = 0;
            var women = 0;
            var children = 0;
            rm.typeRes = [];


            var reservations = rm.reservations.data;
            angular.forEach(reservations, function(reservation, index) {

                reservation.class = 'success';
                inspectToleranceReservation(reservation);

                $interval(function() {
                    inspectToleranceReservation(reservation);
                }, 60000);

                men += reservation.num_people_1;
                women += reservation.num_people_2;
                children += reservation.num_people_3;
                total += reservation.num_guest;

                var source_type = reservation.res_source_type_id;
                var exist = rm.typeRes.hasOwnProperty(source_type);
                if (exist) {
                    rm.typeRes[source_type]++;
                } else {
                    rm.typeRes[source_type] = 1;
                }
            });

            rm.visits.men = men;
            rm.visits.woman = women;
            rm.visits.children = children;
            rm.visits.total_people = men + women + children;
            rm.total_visitas = rm.visits.total_people;
            visitsQuantity();

            rm.typeRes.total_reservas = rm.typeRes.reduce(function(suma, value) {
                return suma + value;
            }, 0);

            rm.total_reservas = rm.typeRes.total_reservas;

            rm.res_listado = Array.prototype.concat.call(reservations, angular.copy(rm.blocks.data));
            rm.getZone();
        };

        rm.getZone = function(reservation) {
            if (rm.lienzo.data.getZoneForTables) {
                angular.forEach(rm.res_listado, function(item) {
                    item.zone = rm.lienzo.data.getZoneForTables(item.tables);
                });
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
                        rm.total_reservas += rm.typeRes[categoria.id] || 0;
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
                            reservation: reservation,
                            tags: rm.tags,
                            status: rm.status,
                            servers: rm.servers,
                            config: rm.configuracion
                        };
                    }
                }
            });

        };

        rm.checkGuestList = function(reservation) {
            rm.disabledModal();

            var modalInstance = $uibModal.open({
                templateUrl: 'ModalCheckGuestList.html',
                controller: 'ModallCheckGuestListCtrl',
                controllerAs: 'gl',
                size: 'md',
                resolve: {
                    reservation: function() {
                        return reservation;
                    },
                    configuration: function() {
                        return rm.configuracion;
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
            //console.log("disabledModal");
            $timeout(function() {
                validaModal = false;
            }, 600);
        };

        var listTypeTurns = function() {
            FloorFactory.listTurnosActivos(rm.fecha_actual).then(function success(response) {
                    //console.log(response);
                    TypeFilterDataFactory.setTypeTurnItems(response);
                    rm.categorias_type = TypeFilterDataFactory.getTypeTurnItems();
                    console.log(rm.categorias_type);
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

        /* INICIALIZAR TODOS LOS DATOS DE FLOOR */

        // var loadDataFloor = function() {

        //     FloorFactory.getDataFloor(null).then(function(response) {
        //         rm.status = response.status;
        //         rm.servers = response.servers;
        //         rm.tags = response.tags;
        //         setConfiguration(response.config);
        //         setCategoriasReserva(response.sourceTypes);
        //         setCategoriasType(response.shifts);
        //     }).catch(function(error) {
        //         message.apiError(error);
        //     });
        // };

        // var setConfiguration = function(configuration) {
        //     rm.configuracion = configuration;
        // };
        var setCategoriasReserva = function() {
            TypeFilterDataFactory.setSourceTypesItems(rm.sourceTypes.data);
            rm.categorias_reserva = TypeFilterDataFactory.getSourceTypesItems();
        };
        var setCategoriasType = function() {
            TypeFilterDataFactory.setTypeTurnItems(rm.shifts.data);
            rm.categorias_type = TypeFilterDataFactory.getTypeTurnItems();
        };
        /* FIN INICIALIZAR TODOS LOS DATOS DE FLOOR */

        var clearState = function() {
            $rootScope.$broadcast("floorClearSelected");
            angular.element('.bg-window-floor').removeClass('drag-dispel');
            FloorFactory.isEditServer(false);
        };

        (function Init() {
            clearState();

            rm.reservations = global.reservations;
            rm.blocks = global.blocks;
            rm.lienzo = global.lienzo;

            rm.configuracion = global.config;

            /**
             * No reflejan cambio en real time, debe estar
             * referenciado aun objeto, y no a un array
             * por adaptar codigo
             */
            rm.status = global.status.data;
            rm.servers = global.servers.data;
            rm.tags = global.tags.data;
            rm.schedule = global.schedule;

            /**
             * Variables de apollo para escuchar los cambios
             */
            rm.sourceTypes = global.sourceTypes;
            rm.shifts = global.shifts;

            $scope.$watch("rm.reservations", statistics, true);
            $scope.$watch("rm.sourceTypes", setCategoriasReserva, true);
            $scope.$watch("rm.shifts", setCategoriasType, true);

            //loadConfiguration();
            //listSourceTypes();
            //listTypeTurns();
        })();
    })
    .controller("editReservationCtrl", ["$rootScope", "$state", "$uibModalInstance", "content", "reservationService", "$q", "global",
        function($rootScope, $state, $uibModalInstance, content, service, $q, global) {

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
            er.existTagsReservations = false;

            er.countKeys = function(obj) {
                return Object.keys(obj).length;
            };

            er.sumar = function(guest) {
                er.reservation.guests[guest]++;
                totalGuests();
                guest_list_valid(guest);
            };

            er.restar = function(guest) {
                var quantity = er.reservation.guests[guest];
                if (quantity - 1 >= 0) {
                    er.reservation.guests[guest]--;
                    totalGuests();
                }
                guest_list_valid(guest);
            };

            /**
             * Validacion de cantidad invitados  vs cantidad en lista de invitados 
             */
            er.guestMessage = {
                men: {
                    text: "• La  cantidad de  hombres es menor a la cantidad de hombres en la lista de invitados.",
                    active: false
                },
                women: {
                    text: "• La  cantidad de  mujeres es menor a la cantidad de mujeres en la lista de invitados.",
                    active: false
                },
                children: {
                    text: "• La  cantidad de  niños es menor a la cantidad de niños en la lista de invitados.",
                    active: false
                }
            };

            var guest_list;
            var guest_list_count = function(reservation) {
                guest_list = reservation.guest_list.reduce(function(count, item) {
                    if (item.type_person === 1) {
                        count.men++;
                    } else if (item.type_person === 2) {
                        count.women++;
                    } else if (item.type_person === 3) {
                        count.children++;
                    }
                    return count;
                }, {
                    men: 0,
                    women: 0,
                    children: 0
                });

                guest_list_valid("men");
                guest_list_valid("women");
                guest_list_valid("children");
            };

            var guest_list_valid = function(guest) {
                if (er.reservation.guests[guest] < guest_list[guest]) {
                    er.guestMessage[guest].active = true;
                } else {
                    er.guestMessage[guest].active = false;
                }
            };
            /**
             * END
             */

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
                    },
                    date_reservation: reservation.date_reservation,
                    hours_reservation: reservation.hours_reservation
                };
                totalGuests();
            }

            function parseInfo(reservation) {
                er.info = {
                    first_name: reservation.guest ? reservation.guest.first_name : "Reservacion sin nombre.",
                    last_name: reservation.guest ? reservation.guest.last_name : "",
                    date: moment(reservation.date_reservation).format("dddd, D [de] MMMM"),
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
                $state.go('mesas.floor.reservation.edit', {
                    id: er.reservation.id,
                    date: er.reservation.date_reservation
                });
            };

            er.cancel = function() {
                $uibModalInstance.dismiss('cancel');
            };

            er.save = function() {
                var id = er.reservation.id;

                if ( (er.configuration.status_people_1 || er.configuration.status_people_2 || er.configuration.status_people_3) &&
                    (er.reservation.status_id == 4 | er.reservation.status_id == 5)) {
                    var suma = er.reservation.guests.men + er.reservation.guests.women + er.reservation.guests.children;
                    if (suma === 0 ) {
                        return message.alert("Es obligatorio indicar cantidad de invitados por tipo", "Este campo se encuentra en la parte inferior del formulario.");
                    }
                } else {
                    er.reservation.guests.men  = 0;
                    er.reservation.guests.women = 0;
                    er.reservation.guests.children = 0;
                }

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

                    var key = service.blackList.key();

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

            /*function listResource() {
                return $q.all([
                    listGuest(),
                    //listStatuses(),
                    //listServers(),
                    //loadConfiguration(),
                    //listReservationTags()
                ]);
            }*/

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

                service.getGuest().then(function(guests) {
                    er.covers = guests;
                });
                er.statuses = global.status.data;
                er.servers = global.servers.data;
                er.tags = global.tags.data;
                er.configuration = global.config;
                resetTags();
                parseInfo(content.reservation);
                parseData(content.reservation);
                paintTags(content.reservation.tags);
                guest_list_count(content.reservation);

            })();
        }
    ])
    .controller('ModalMailReservationCtrl', function($uibModalInstance, reservation, FloorDataFactory) {
        var vm = this;

        vm.reservation = {
            date: '',
            time: '',
            email: '',
            nombre: '',
            messages: []
        };

        vm.mailData = {
            message: '',
            subject: '',
            email: ''
        };

        var init = function() {
            //console.log(angular.toJson(reservation, true));
            vm.reservation.date = reservation.date_reservation;
            vm.reservation.time = reservation.hours_reservation;
            vm.reservation.email = reservation.email;
            var first_name = reservation.guest ? reservation.guest.first_name : "Reservacion sin nombre";
            var last_name = reservation.guest ? reservation.guest.last_name : "";
            vm.reservation.nombre = first_name + " - " + last_name;
            vm.reservation.note = reservation.note;
            vm.reservation.messages = reservation.emails;
            vm.mailData.email = reservation.email;

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
    })
    .controller("ModallCheckGuestListCtrl", ["$uibModalInstance", "$q", "reservationService", "reservation", "configuration", function($uibModalInstance, $q, reservationService, reservation, configuration) {

        var vm = this;
        vm.guestListAdd = [];
        vm.person = {
            man: {
                quantity: 0,
                auxiliar: 0,
                min: 0
            },
            woman: {
                quantity: 0,
                auxiliar: 0,
                min: 0
            },
            children: {
                quantity: 0,
                auxiliar: 0,
                min: 0
            },
            total: 0
        };

        var person = {
            man: 1,
            woman: 2,
            children: 3
        };

        vm.changeArrived = function(item) {
            if (!item.arrived) item.type_person = null;
            vm.countPerson();
        };

        vm.addGuest = function() {
            var guest = {
                name: vm.newGuest,
                arrived: 0,
                type_person: null
            };
            vm.guestListAdd.push(guest);
            vm.newGuest = null;
        };

        vm.countPerson = function(item, key) {
            vm.person.man.quantity = 0;
            vm.person.woman.quantity = 0;
            vm.person.children.quantity = 0;
            vm.person.man.auxiliar = vm.person.man.min;
            vm.person.woman.auxiliar = vm.person.woman.min;
            vm.person.children.auxiliar = vm.person.children.min;
            vm.person.total = 0;

            angular.forEach(vm.guestList, function(item) {
                if (!item.status) return;
                if (item.type_person === 1) {
                    vm.person.man.quantity++;
                    if (vm.person.man.quantity > vm.person.man.min) {
                        vm.person.man.auxiliar = vm.person.man.quantity;
                    }
                } else if (item.type_person === 2) {
                    vm.person.woman.quantity++;
                    if (vm.person.woman.quantity > vm.person.woman.min) {
                        vm.person.woman.auxiliar = vm.person.woman.quantity;
                    }
                } else if (item.type_person === 3) {
                    vm.person.children.quantity++;
                    if (vm.person.children.quantity > vm.person.children.min) {
                        vm.person.children.auxiliar = vm.person.children.quantity;
                    }
                }

                vm.person.total += item.arrived;
            });

            angular.forEach(vm.guestListAdd, function(item) {
                if (item.type_person === 1) {
                    vm.person.man.quantity++;
                    if (vm.person.man.quantity > vm.person.man.min) {
                        vm.person.man.auxiliar = vm.person.man.quantity;
                    }
                } else if (item.type_person === 2) {
                    vm.person.woman.quantity++;
                    if (vm.person.woman.quantity > vm.person.woman.min) {
                        vm.person.woman.auxiliar = vm.person.woman.quantity;
                    }
                } else if (item.type_person === 3) {
                    vm.person.children.quantity++;
                    if (vm.person.children.quantity > vm.person.children.min) {
                        vm.person.children.auxiliar = vm.person.children.quantity;
                    }
                }

                vm.person.total += item.arrived;
            });
        };

        vm.changePerson = function(item, key) {
            var auxiliar = item[key];

            item.man = 0;
            item.woman = 0;
            item.children = 0;
            item[key] = auxiliar;

            if (item[key] === 0) {
                item.type_person = null;
                item.arrived = 0;
            } else {
                item.type_person = person[key];
                item.arrived = 1;
            }

            vm.countPerson();
        };

        var initList = function() {
            angular.forEach(vm.guestList, function(item) {
                if (item.type_person === 1) {
                    item.man = 1;
                } else if (item.type_person === 2) {
                    item.woman = 1;
                } else if (item.type_person === 3) {
                    item.children = 1;
                }
            });

            angular.forEach(vm.guestListAdd, function(item) {
                if (item.type_person === 1) {
                    item.man = 1;
                } else if (item.type_person === 2) {
                    item.woman = 1;
                } else if (item.type_person === 3) {
                    item.children = 1;
                }
            });

            vm.countPerson();
        };

        vm.removeGuestListAdd = function(i) {
            vm.guestListAdd.splice(i, 1);
            vm.countPerson();
        };

        vm.removeGuestList = function(item) {
            item.status = 0;
            vm.countPerson();
        };

        vm.save = function() {
            vm.waitingResponse = true;
            reservationService.guestList(reservation.id, {
                guest_list: vm.guestList,
                guest_list_add: vm.guestListAdd
            }).then(
                function success(response) {
                    angular.forEach(response.data.data, function(value, key) {
                        reservation[key] = value;
                    });
                    message.success("Se actualizo lista de invitados");
                    vm.waitingResponse = false;
                    vm.cancel();
                },
                function error(error) {
                    message.apiError(error);
                    vm.waitingResponse = false;
                });
        };

        vm.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

        var initModule = function() {
            vm.configPeople = configuration.status_people_1 + configuration.status_people_2 + configuration.status_people_3;
            vm.configuration = configuration;
            vm.person.man.min = reservation.num_people_1 * 1;
            vm.person.woman.min = reservation.num_people_2 * 1;
            vm.person.children.min = reservation.num_people_3 * 1;

            vm.guestList = angular.copy(reservation.guest_list);
            initList();
        };

        (function init() {
            initModule();
        })();
    }]);