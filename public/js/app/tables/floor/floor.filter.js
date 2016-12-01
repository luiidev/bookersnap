angular.module('floor.filter', [])
    .filter("statusReservation", function() {
        return function(valor) {
            if (valor !== null) {
                var name_status = "";
                switch (valor) {
                    case 1:
                        name_status = "not-confirmed";
                        break;
                    case 2:
                        name_status = "confirmed";
                        break;
                    case 3:
                        name_status = "left-message";
                        break;
                    case 4:
                        name_status = "seated";
                        break;
                    case 5:
                        name_status = "wrong-number";
                        break;
                    case 6:
                        name_status = "partially-arrived";
                        break;
                    case 7:
                        name_status = "all-arrived";
                        break;
                    case 8:
                        name_status = "paged";
                        break;
                    case 9:
                        name_status = "running-late";
                        break;
                    case 10:
                        name_status = "finished";
                        break;
                    case 11:
                        name_status = "canceled-guest";
                        break;
                    case 12:
                        name_status = "canceled-restaurant";
                        break;
                    case 13:
                        name_status = "no-show";
                        break;
                    case 14:
                        name_status = "no-answer";
                        break;
                    case 15:
                        name_status = "partially-seated";
                        break;
                    case 16:
                        name_status = "entree";
                        break;
                    case 17:
                        name_status = "dessert";
                        break;
                    case 18:
                        name_status = "table-cleared";
                        break;
                    case 19:
                        name_status = "appetizer";
                        break;
                    case 20:
                        name_status = "check-dropped";
                        break;
                    case 21:
                        name_status = "check-paid";
                        break;
                    default:
                        name_status = "";
                        break;
                }
                return name_status;
            }
        };
    })
    .filter("statusCondicion", function() {
        return function(items) {
            var salida = [];
            angular.forEach(items, function(item) {
                if (item.res_reservation_status_id !== null && item.tables.length !== 0) {
                    var status = item.res_reservation_status_id;
                    switch (status) {
                        case 1:
                        case 2:
                        case 3:
                            salida.push(item);
                            break;
                    }

                }
            });
            return salida;
        };
    })
    .filter("waitlistCondicion", function() {
        return function(items) {
            var salida = [];
            angular.forEach(items, function(item) {
                if (item.wait_list == 1 && item.tables.length === 0) {
                    var status = item.res_reservation_status_id;
                    switch (status) {
                        case 1:
                        case 2:
                        case 3:
                        case 6:
                        case 7:
                            salida.push(item);
                            break;
                    }

                }
            });
            return salida;
        };
    })
    .filter("waitlist", function() {
        return function(items) {
            var salida = items.filter(function(item) {
                return item.wait_list === 0 || (item.wait_list == 1 && item.res_reservation_status_id == 4) || item.res_block_id;
            });

            return salida;
        };
    })
    .filter("statusSeated", function() {
        return function(items) {
            var salida = [];
            angular.forEach(items, function(item) {
                if (item.res_reservation_status_id !== null && item.tables.length !== 0) {
                    var status = item.res_reservation_status_id;
                    switch (status) {
                        case 4:
                            salida.push(item);
                            break;
                    }

                }
            });
            return salida;
        };
    })
    .filter("statusAll", function() {
        return function(items) {
            var salida = [];
            angular.forEach(items, function(item) {
                if (item.res_reservation_status_id !== null && item.tables.length !== 0) {
                    salida.push(item);
                }
            });
            return salida;
        };
    })
    .filter('gender', function() {
        return function(items, categorias) {
            var salida = [];

            if (!categorias.length) {
                return items;
            }

            var filterPeople1 = false;
            var filterPeople2 = false;
            var filterPeople3 = false;

            angular.forEach(categorias, function(categoria) {
                var idcategoria = categoria.id;
                if (idcategoria === 2) {
                    filterPeople1 = true;
                }
                if (idcategoria === 3) {
                    filterPeople2 = true;
                }
                if (idcategoria === 4) {
                    filterPeople3 = true;
                }
            });

            angular.forEach(items, function(item) {
                var filter = (filterPeople1 && item.num_people_1 > 0) || (filterPeople2 && item.num_people_2 > 0) || (filterPeople3 && item.num_people_3 > 0);
                if (filter) {
                    salida.push(item);
                }
            });

            return salida;
        };
    })
    .filter('typeRes', function() {
        return function(items, categorias) {
            var salida = [];

            if (categorias.length === 0) {
                return items;
            }

            var filterWeb = false;
            var filterTelefono = false;
            var filterPortal = false;
            var filterRP = false;

            angular.forEach(categorias, function(categoria) {
                var idcategoria = categoria.id;
                if (idcategoria === 1) {
                    filterWeb = true;
                }
                if (idcategoria === 2) {
                    filterTelefono = true;
                }
                if (idcategoria === 3) {
                    filterPortal = true;
                }
                if (idcategoria === 4) {
                    filterRP = true;
                }
            });

            angular.forEach(items, function(item) {
                var filter = (filterWeb && item.res_source_type_id == 1) || (filterTelefono && item.res_source_type_id == 2) || (filterPortal && item.res_source_type_id == 3) || (filterRP && item.res_source_type_id == 4);
                if (filter) {
                    salida.push(item);
                }
            });

            return salida;
        };
    })
    .filter('typeTurn', function() {
        return function(items, categorias) {
            var salida = [];

            if (categorias.length === 0) {
                return items;
            }

            salida = items.filter(function(item) {
                return categorias.some(function(category) {
                    return category.turn.id == item.res_turn_id;
                });
            });

            return salida;
        };
    })
    .filter("statusTurnos", function(TypeFilterDataFactory, $filter) {
        return function(valor) {
            if (valor !== null) {
                var name_status = "";
                var listadoTurns = TypeFilterDataFactory.getTypeTurnItems();
                angular.forEach(listadoTurns, function(turn) {
                    if (turn.id == valor) {
                        name_status = $filter('uppercase')(turn.name);
                    }
                });
                return name_status;
            }
        };
    })
    .filter("statusReservas", function(TypeFilterDataFactory, $filter) {
        return function(valor) {
            if (valor !== null) {
                var name_status = "";
                var listadoReservations = TypeFilterDataFactory.getSourceTypesItems();
                angular.forEach(listadoReservations, function(reserva) {
                    if (reserva.id == valor) {
                        name_status = $filter('uppercase')(reserva.name);
                    }
                });
                return name_status;
            }
        };
    })
    .filter("statusEstados", function(TypeFilterDataFactory, $filter) {
        return function(valor, opcion) {

            if (valor !== null) {
                var name_status = "";
                var color = "";
                var listadoStatus = TypeFilterDataFactory.getStatusTypesItems();
                angular.forEach(listadoStatus, function(status) {
                    if (status.id == valor) {
                        name_status = $filter('uppercase')(status.name);
                        color = status.color;
                    }
                });
                if (opcion == "name") {
                    return name_status;
                } else if (opcion == "color") {
                    return color;
                }
            }
        };
    }).filter('customStatus', function() {
        return function(list, arrayFilter, element) {
            if (arrayFilter.length === 0) {
                return list;
            }

            var salida = list.filter(function(item) {
                if (item.res_block_id) return false;
                var status = arrayFilter.indexOf(item[element]) != -1;
                var waitlist = item.wait_list === 0 || (item.wait_list == 1 && item.res_reservation_status_id == 4);
                return status && waitlist;
            });
            return salida;
        };
    })
    .filter("blocks", function() {
        return function(list) {
            var salida = list.reduce(function(array, item) {
                // Si es una reservacion - devuelve la reservacion
                if (item.id) {
                    array.push(item);
                } else if (item.res_block_id) { //Si es un bloqueo - Analiza si ya existe un bloqueo similar (api devuelve un bloqueo por mesa, no bloqueo con sus mesas)
                    // Pregunta si ya existe el bloqueo
                    var exists = array.some(function(itemX) {
                        return itemX.res_block_id == item.res_block_id;
                    });

                    // Si no existe agrego el bloqueo a la lista a retornar
                    if (!exists) {
                        array.push(item);
                    }
                }

                return array;
            }, []);

            return salida;
        };
    });