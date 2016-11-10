angular.module('floor.controller')
    .controller('reservationController', function($scope, $rootScope, $uibModal, $timeout, FloorFactory, ServerDataFactory, TypeFilterDataFactory, FloorDataFactory) {
        var rm = this;

        var fecha_actual = getFechaActual();
        var colection_filtro_visitas = TypeFilterDataFactory.getOpcionesFilterVisitas();
        rm.fecha_actual = fecha_actual;

        rm.search = {
            show: true
        };
        rm.searchReservation = function() {
            rm.search.show = !rm.search.show;
            rm.busqueda = "";
        };

        //Validar open modal Mail Reservation
        var modalMailReservation = null;

        $rootScope.$broadcast("floorClearSelected");

        var defaultOptionsFilters = function() {
            //Datos y acciones para filtrar Visitas//
            //****************************//
            rm.categorias_people = [{
                idcategoria: 1,
                nombre: 'Todos',
                checked: true,
            }, {
                idcategoria: 2,
                nombre: 'Hombres',
                checked: false,
            }, {
                idcategoria: 3,
                nombre: 'Mujeres',
                checked: false,
            }, {
                idcategoria: 4,
                nombre: 'Niños(as)',
                checked: false,
            }];
        };



        var getColectionReservation = function() {

            FloorFactory.getConfiguracionPeople().then(function(response) {
                rm.configuracion = {
                    status_people_1: response.status_people_1,
                    status_people_2: response.status_people_2,
                    status_people_3: response.status_people_3,
                };
                //console.log("Configuracion: " + angular.toJson(rm.configuracion, true));
            });

            FloorFactory.getServicioReservaciones().then(function(response) {

                rm.res_listado_all = response;

                var total = 0;
                var men = 0;
                var women = 0;
                var children = 0;
                var tWeb = 0;
                var tTel = 0;
                var tPor = 0;
                var tRp = 0;

                rm.res_listado = rm.res_listado_all;

                //console.log(angular.toJson(rm.res_listado, true));
                angular.forEach(rm.res_listado_all, function(people) {
                    if (people.reservation_id) {

                        men += people.num_people_1;

                        women += people.num_people_2;

                        children += people.num_people_3;

                        total += people.num_people;

                        var source_type = people.res_source_type_id;
                        switch (source_type) {
                            case 1:
                                tWeb += 1;
                                break;
                            case 2:
                                tTel += 1;
                                break;
                            case 3:
                                tPor += 1;
                                break;
                            case 4:
                                tRp += 1;
                                break;
                        }
                    }
                });

                rm.total_men = men;
                rm.total_women = women;
                rm.total_children = children;
                rm.total_people = total;
                rm.total_visitas = total;

                rm.total_tweb = tWeb;
                rm.total_ttel = tTel;
                rm.total_tpor = tPor;
                rm.total_trp = tRp;
                rm.total_reservas = rm.total_tweb + rm.total_ttel + rm.total_tpor + rm.total_trp;

            });

            FloorFactory.getBlocksForReservation().then(function(response) {
                FloorFactory.mergeBlockToReservation(response);
                //asignar servicio de reservaciones
                //console.log("blockReservation: " + angular.toJson(response, true));
            });
        };

        $scope.$on("NotifyFloorTableReservationReload", function(evt, data) {

            if (data.action == "update") {
                angular.forEach(data.data, function(data) {
                    var reservaTest = FloorFactory.parseDataReservation(data);
                    FloorFactory.addServicioReservaciones(reservaTest);
                });
            } else if (data.action == "create") {
                var reservaTest = FloorFactory.parseDataReservation(data.data);
                FloorFactory.addServicioReservaciones(reservaTest);
            }
            $scope.$apply();
            alertMultiple("Notificación: ", data.user_msg, "inverse", null, 'top', 'left', 10000, 20, 150);
            //messageAlert("Notificación", data.user_msg, "info", 2000, true);
            //console.log("Formato: " + angular.toJson(reservaTest, true));
        });


        rm.select_type = function(categoria, event) {
            rm.filter_type = categoria;

            if (event !== null) {
                event.stopPropagation();
            }

            if (categoria.id !== 0) {
                //Evalua Cualquier Opcion diferente de Todos
                if (categoria.checked === true) { //Deshabilitar
                    TypeFilterDataFactory.delOpcionesFilterTurnos(categoria);
                    categoria.checked = false;
                    filtrarTurnos();
                } else { //Habilitar y Deshabilitar todos
                    categoria.checked = true;
                    TypeFilterDataFactory.setOpcionesFilterTurnos(categoria);
                    rm.categorias_type[0].checked = false;
                    filtrarTurnos();
                }
            } else {
                //Evalua Opcion TODOS
                var deshabilitar = function() {
                    rm.filter_type = categoria;
                    angular.forEach(rm.categorias_type, function(type) {
                        if (type.id !== 0) {
                            TypeFilterDataFactory.delOpcionesFilterTurnos(type);
                            type.checked = false;
                        }
                    });
                };

                if (categoria.checked === true) {
                    deshabilitar();
                } else {
                    categoria.checked = true;
                    deshabilitar();
                }
            }

            return false;
        };
        var filtrarTurnos = function() {
            var colection_filtro_turnos = TypeFilterDataFactory.getOpcionesFilterTurnos();
            rm.filter_type = colection_filtro_turnos;
            if (rm.filter_type.length === 0) {
                rm.categorias_type[0].checked = true;
            }
            //console.log(rm.filter_type);
        };

        rm.select_people = function(categoria, event) {

            rm.filter_people = categoria;

            if (event !== null) {
                event.stopPropagation();
            }

            if (categoria.idcategoria != 1) {
                //Evalua Cualquier Opcion diferente de Todos
                if (categoria.checked === true) { //Deshabilitar
                    TypeFilterDataFactory.delOpcionesFilterVisitas(categoria);
                    categoria.checked = false;
                    filtrarVisitas();
                } else { //Habilitar y Deshabilitar todos
                    categoria.checked = true;
                    TypeFilterDataFactory.setOpcionesFilterVisitas(categoria);
                    rm.categorias_people[0].checked = false;
                    filtrarVisitas();
                }
            } else {
                //Evalua Opcion TODOS
                var deshabilitar = function() {
                    rm.filter_people = categoria;
                    angular.forEach(rm.categorias_people, function(gender) {
                        if (gender.idcategoria !== 1) {
                            TypeFilterDataFactory.delOpcionesFilterVisitas(gender);
                            gender.checked = false;
                        }
                    });
                    rm.res_listado = rm.res_listado_all;
                };

                if (categoria.checked === true) {
                    deshabilitar();
                } else {
                    rm.total_visitas = rm.total_people;
                    categoria.checked = true;
                    deshabilitar();
                }
            }
            return false;
        };
        var filtrarVisitas = function() {
            var colection_filtro_visitas = TypeFilterDataFactory.getOpcionesFilterVisitas();
            rm.filter_people = colection_filtro_visitas;

            if (rm.filter_people.length === 0) {
                rm.categorias_people[0].checked = true;
                rm.total_visitas = rm.total_people;
            } else {
                var calculo = 0;
                angular.forEach(rm.filter_people, function(genero) {
                    var idgenero = genero.idcategoria;
                    //console.log(idgenero);
                    switch (idgenero) {
                        case 2:
                            calculo += rm.total_men;
                            break;
                        case 3:
                            calculo += rm.total_women;
                            break;
                        case 4:
                            calculo += rm.total_children;
                            break;
                    }
                });
                rm.total_visitas = calculo;
            }

            //Filtrado realizado por .filter de angular//
            /*
            var salida = [];
            if (rm.filter_people.length !== 0) {

                angular.forEach(rm.res_listado_all, function(item, index) {
                    angular.forEach(rm.filter_people, function(genero) {
                        var idgenero = genero.idcategoria;
                        switch (idgenero) {
                            case 2:
                                if (item.num_people_1 !== 0) {
                                    angular.forEach(salida, function(value, key) {
                                        if (value.reservation_id == item.reservation_id) {
                                            salida.splice(key, 1);
                                        }
                                    });
                                    salida.push(item);
                                }

                                break;
                            case 3:
                                if (item.num_people_2 !== 0) {
                                    angular.forEach(salida, function(value, key) {
                                        if (value.reservation_id == item.reservation_id) {
                                            salida.splice(key, 1);
                                        }
                                    });
                                    salida.push(item);
                                }
                                break;
                            case 4:

                                if (item.num_people_3 !== 0) {
                                    angular.forEach(salida, function(value, key) {
                                        if (value.reservation_id == item.reservation_id) {
                                            salida.splice(key, 1);
                                        }
                                    });
                                    salida.push(item);
                                }
                                break;

                        }
                    });
                });
                rm.res_listado = salida;
            } else {
                angular.forEach(rm.res_listado_all, function(item, index) {
                    salida.push(item);
                });
                rm.res_listado = salida;
            }
            */
        };

        rm.select_reserva = function(categoria, event) {

            rm.filter_reserva = categoria;

            if (event !== null) {
                event.stopPropagation();
            }

            if (categoria.id !== 0) {
                //Evalua Cualquier Opcion diferente de Todos
                if (categoria.checked === true) { //Deshabilitar
                    TypeFilterDataFactory.delOpcionesFilterReservas(categoria);
                    categoria.checked = false;
                    filtrarReservas();
                } else { //Habilitar y Deshabilitar todos
                    categoria.checked = true;
                    TypeFilterDataFactory.setOpcionesFilterReservas(categoria);
                    rm.categorias_reserva[0].checked = false;
                    filtrarReservas();
                }
            } else {
                //Evalua Opcion TODOS
                var deshabilitar = function() {
                    rm.filter_reserva = categoria;
                    angular.forEach(rm.categorias_reserva, function(reserva) {
                        if (reserva.id !== 0) {
                            TypeFilterDataFactory.delOpcionesFilterReservas(reserva);
                            reserva.checked = false;
                        }
                    });

                };

                if (categoria.checked === true) {
                    deshabilitar();
                } else {
                    categoria.checked = true;
                    rm.total_reservas = rm.total_tweb + rm.total_ttel + rm.total_tpor + rm.total_trp;
                    deshabilitar();
                }
            }
            return false;
        };
        var filtrarReservas = function() {
            var colection_filtro_reservas = TypeFilterDataFactory.getOpcionesFilterReservas();
            rm.filter_reserva = colection_filtro_reservas;
            if (rm.filter_reserva.length === 0) {
                rm.categorias_reserva[0].checked = true;
                rm.total_reservas = rm.res_listado_all.length;
            } else {
                var calculo = 0;
                angular.forEach(rm.filter_reserva, function(reserva) {
                    var idreserva = reserva.id;
                    //console.log(idreserva);
                    switch (idreserva) {
                        case 1:
                            calculo += rm.total_tweb;
                            break;
                        case 2:
                            calculo += rm.total_ttel;
                            break;
                        case 3:
                            calculo += rm.total_tpor;
                            break;
                        case 4:
                            calculo += rm.total_trp;
                            break;
                    }
                });
                rm.total_reservas = calculo;
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
            if (modalMailReservation === null) {
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
            }
        };

        rm.infoReservationShow = function() {
            var icon = true;
            console.log('sd');
        };
        rm.mailReservationShow = function(reservation) {
            //console.log("mailReservationShow " + angular.toJson(reservation, true));
            modalMailReservation = $uibModal.open({
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

            $timeout(function() {
                modalMailReservation = null;
            }, 500);
        };

        var listTypeTurns = function() {
            FloorFactory.listTurnosActivos(rm.fecha_actual).then(function success(response) {

                    TypeFilterDataFactory.setTypeTurnItems(response);
                    rm.categorias_type = TypeFilterDataFactory.getTypeTurnItems();

                    TypeFilterDataFactory.setOpcionesFilterTurnos(rm.categorias_type[0]);
                    var colection_filtro_turnos = TypeFilterDataFactory.getOpcionesFilterTurnos();
                    rm.select_type(colection_filtro_turnos[0], null);
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

                TypeFilterDataFactory.setOpcionesFilterReservas(rm.categorias_reserva[0]);
                var colection_filtro_reservas = TypeFilterDataFactory.getOpcionesFilterReservas();
                rm.select_reserva(colection_filtro_reservas[0], null);

            }, function error(error) {
                message.apiError(error);
            });
        };


        var init = function() {

            getColectionReservation();

            defaultOptionsFilters();

            //Definir para filtro por defecto para visitas
            TypeFilterDataFactory.setOpcionesFilterVisitas(rm.categorias_people[0]);
            rm.select_people(colection_filtro_visitas[0], null);

            //Limpiar data y estilos de servers
            FloorFactory.isEditServer(false);
            angular.element('.bg-window-floor').removeClass('drag-dispel');
            // angular.element('.table-zone').removeClass("selected-table");

            ServerDataFactory.cleanTableServerItems();

            rm.categorias_type = TypeFilterDataFactory.getTypeTurnItems();
            if (rm.categorias_type.length === 0) {
                listTypeTurns();
            } else {
                TypeFilterDataFactory.setOpcionesFilterTurnos(rm.categorias_type[0]);
                var colection_filtro_turnos = TypeFilterDataFactory.getOpcionesFilterTurnos();
                rm.select_type(colection_filtro_turnos[0], null);
            }

            rm.categorias_reserva = TypeFilterDataFactory.getSourceTypesItems();
            if (rm.categorias_reserva.length === 0) {
                listSourceTypes();
            } else {
                TypeFilterDataFactory.setOpcionesFilterReservas(rm.categorias_reserva[0]);
                var colection_filtro_reservas = TypeFilterDataFactory.getOpcionesFilterReservas();
                rm.select_reserva(colection_filtro_reservas[0], null);
            }


        };

        init();
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
                    id: reservation.reservation_id,
                    covers: reservation.num_people,
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
                    first_name: reservation.first_name,
                    last_name: reservation.last_name,
                    date: moment(reservation.start_date).format("dddd, d [de] MMMM"),
                    time: moment(reservation.start_time, "HH:mm:ss").format("H:mm A"),
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
    ]);