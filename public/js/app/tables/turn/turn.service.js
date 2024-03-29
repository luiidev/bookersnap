angular.module('turn.service', [])
    .factory('TurnDataFactory', function($http, ApiUrlMesas, ApiUrlRoot) {
        return {
            getTurns: function(vOptions) {
                return $http.get(ApiUrlMesas + "/turns?" + vOptions);
            },
            getTurn: function(vTurn, vOptions) {
                return $http.get(ApiUrlMesas + "/turns/" + vTurn + "?" + vOptions);
            },
            deleteTurn: function(vId) {
                return $http.delete(ApiUrlMesas + "/turns/" + vId);
            },
            createTurn: function(vData) {
                return $http.post(ApiUrlMesas + "/turns", vData);
            },
            updateTurn: function(vData) {
                return $http.put(ApiUrlMesas + "/turns/" + vData.id, vData);
            },
            getTurnsAvailables: function(vDate) {
                return $http.get(ApiUrlMesas + "/turns/" + vDate + "/availables");
            },
            searchTurn: function(vData) {
                return $http.get(ApiUrlMesas + "/turns/search?" + vData);
            },
            getTurnZoneTables: function(vZone, vTurn) {
                return $http.get(ApiUrlMesas + "/turns/" + vTurn + "/zones/" + vZone + "/tables");
            }
        };
    })
    .factory('TypeTurnFactory', function($http, ApiUrlMesas, ApiUrlRoot) {

        return {
            getTypeTurns: function() {
                return $http.get(ApiUrlRoot + "/type-turns");
            },
            getDaysTypeTurn: function(vTypeTurn) {
                return $http.get(ApiUrlMesas + "/type-turn/" + vTypeTurn + "/days");
            }

        };
    })
    .factory('DateFactory', function($http, $filter) {

        return {
            timeFormat: function(time) {
                return $filter('date')(time, 'HH:mm:ss');
            }
        };
    })
    .factory('TurnFactory', function(TurnDataFactory, DateFactory, ZoneFactory, $q) {

        return {
            //Listado de turnos
            listTurns: function(options) {
                var defered = $q.defer();

                TurnDataFactory.getTurns(options).success(function(data) {
                    var turnsData = {
                        active: [],
                        inactive: []
                    };

                    angular.forEach(data.data, function(turns) {
                        var vZones = [];

                        angular.forEach(turns.zones, function(zones) {
                            vZones.push(zones.name);
                        });

                        turns.zones = vZones.join(", ");

                        if (turns.calendar.length > 0) {
                            turnsData.active.push(turns);
                        } else {
                            turnsData.inactive.push(turns);
                        }

                    });

                    defered.resolve(turnsData);

                }).error(function(data, status, headers) {
                    var response = {
                        data: data,
                        status: status,
                        headers: headers
                    };
                    defered.reject(response);
                });

                return defered.promise;
            },
            //Elimina un turno
            deleteTurn: function(idTurn) {
                var defered = $q.defer();

                TurnDataFactory.deleteTurn(idTurn).then(
                    function success(response) {
                        defered.resolve(response.data);
                    },
                    function error(response) {
                        defered.reject(response);
                    }
                );

                return defered.promise;
            },
            //Valida turno
            validateTurn: function(turnData, turnForm, turnDataClone) {
                var valTime = {
                    hours_ini: DateFactory.timeFormat(turnForm.hours_ini),
                    hours_end: DateFactory.timeFormat(turnForm.hours_end),
                    type_turn: turnForm.type_turn.id
                };

                var defered = $q.defer();
                var vParams = getAsUriParameters(valTime);

                TurnDataFactory.searchTurn(vParams).success(function(data) {
                    if (data.data.length === 0 || (turnDataClone.hours_ini === valTime.hours_ini && turnDataClone.hours_end == valTime.hours_end)) {
                        defered.resolve(false);
                    } else {
                        defered.resolve(true);
                    }
                }).error(function(data, status, headers) {
                    defered.reject(data);
                });

                return defered.promise;
            },
            //Listado de zonas con sus turno
            listZones: function() {
                var defered = $q.defer();
                var params = "with=turns";

                ZoneFactory.getZones(params).success(function(data) {
                    var zones = [];
                    angular.forEach(data.data, function(value, key) {
                        var turnsData = [];
                        angular.forEach(value.turns, function(turns, key) {
                            turnsData.push(turns.name);
                        });

                        value.turns_asign = turnsData.join(", ");
                        zones.push(value);
                    });

                    defered.resolve(zones);

                }).error(function(data, status, headers) {
                    defered.reject(data);
                });

                return defered.promise;
            },
            //Guardar los datos del turno
            saveTurn: function(turnData, option) {
                var defered = null;

                if (option == "create") {
                    defered = TurnDataFactory.createTurn(turnData);
                } else {
                    defered = TurnDataFactory.updateTurn(turnData);
                }

                return defered;
            },
            //Construye la estructura para enviarla a la api
            constructStructureSave: function(turnData, turnForm, turnZoneAdd) {

                turnData.hours_ini = turnForm.hours_ini.time_original;
                turnData.hours_end = turnForm.hours_end.time_original;

                turnData.res_type_turn_id = turnForm.type_turn.id;

                var turnZones = [];
                var self = this;

                angular.forEach(turnZoneAdd.zones_id, function(zones, key) {
                    var turnRuleId = self.getTurnRuleId(turnZoneAdd.zonesTables, zones);

                    if (turnRuleId === null || turnRuleId === "") {
                        turnZones.push({
                            res_zone_id: zones,
                            res_turn_rule_id: 1,
                            tables: []
                        });
                    } else {
                        turnZones.push({
                            res_zone_id: zones,
                            res_turn_rule_id: turnRuleId,
                            tables: self.getTablesZoneRules(turnZoneAdd.zonesTables, zones)
                        });
                    }

                });

                angular.forEach(turnZoneAdd.zonesDeleted, function(zones, key) {
                    turnZones.push(zones);
                });

                turnData.turn_zone = turnZones;

                return turnData;
            },
            //Obtiene la regla del turno
            getTurnRuleId: function(zonesTables, zoneId) {
                var turnRuleId = null;
                angular.forEach(zonesTables, function(value, key) {
                    if (value.zone_id == zoneId) {
                        turnRuleId = value.res_turn_rule_id;
                    }
                });
                return turnRuleId;
            },
            //Obtiene las mesas de la zona que ha sido agregadas
            getTablesZoneRules: function(zonesTables, zoneId) {
                var data = {};
                angular.forEach(zonesTables, function(value, key) {
                    if (value.zone_id == zoneId) {
                        data = value.tables;
                    }
                });
                return data;
            },
            //Agrega a la lista de zonas eliminadas (para enviarlo a la api)
            deleteZone: function(turnZoneAdd, zoneId, zoneRule, option) {
                var index = turnZoneAdd.zones_id.indexOf(zoneId);

                if (index != -1) {
                    turnZoneAdd.zones_id.splice(index, 1);
                    turnZoneAdd.zones_data.splice(index, 1);
                }

                angular.forEach(turnZoneAdd.zonesTables, function(zone, key) {
                    if (zone.zone_id == zoneId) {
                        turnZoneAdd.zonesTables.splice(key, 1);
                    }
                });

                if (option == "edit") {
                    var vData = {
                        res_zone_id: zoneId,
                        res_turn_rule_id: zoneRule,
                        unlink: true,
                        tables: []
                    };

                    var validaDelete = 0;

                    angular.forEach(turnZoneAdd.zonesDeleted, function(zone, key) {
                        if (zone.zone_id == zoneId) {
                            validaDelete = 1;
                        }
                    });

                    if (validaDelete === 0) {
                        turnZoneAdd.zonesDeleted.push(vData);
                    }
                }
            },
            //Obtiene el turno
            getTurn: function(idTurn, options, listAvailability) {
                var defered = $q.defer();
                var self = this;

                TurnDataFactory.getTurn(idTurn, options).success(function(data) {
                    data = data.data;
                    var turnData = {
                        id: data.id,
                        name: data.name,
                        hours_ini: data.hours_ini,
                        hours_end: data.hours_end,
                        days: data.days,
                        turn_time: data.turn_time
                    };

                    var nextDay = getHourNextDay(data.hours_ini, data.hours_end);
                    var hour_ini = getIndexHour(data.hours_ini, 0);
                    var hour_end = getIndexHour(data.hours_end, nextDay); //esto pendiente

                    var turnForm = {
                        hours_ini: {
                            index: hour_ini,
                            time_original: data.hours_ini,
                            time: listAvailability[hour_ini].time
                        },
                        hours_end: {
                            index: hour_end,
                            time_original: data.hours_end,
                            time: listAvailability[hour_end].time
                        },
                        type_turn: {
                            id: data.res_type_turn_id,
                            label: ''
                        },
                        days: self.activeCheckDays(data.days)
                    };

                    var turnDataClone = turnData;
                    var zonesId = [];
                    var dataZones = [];

                    angular.forEach(data.turn_zone, function(zones) {
                        zonesId.push(zones.zone.id);

                        var turnsData = [];

                        angular.forEach(zones.zone.turns, function(turns, key) {
                            turnsData.push(turns.name);
                        });

                        zones.zone.turns_asign = turnsData.join(", ");
                        zones.zone.rule = zones.rule;
                        dataZones.push(zones.zone);
                    });

                    var responseData = {
                        turnData: turnData,
                        turnForm: turnForm,
                        turnDataClone: turnDataClone,
                        zonesId: zonesId,
                        dataZones: dataZones
                    };

                    defered.resolve(responseData);

                }).error(function(data, status, headers) {
                    defered.reject(data);
                });

                return defered.promise;
            },
            //Marca los dias asignados
            activeCheckDays: function(days) {
                var daysData = [];

                for (var i = 1; i <= 7; i++) {
                    var checked = (days.indexOf(i) != -1) ? true : false;
                    daysData.push({
                        id: i,
                        checked: checked
                    });
                }
                return daysData;
            },
            //Listado de mesas de la zona
            getTurnZoneTables: function(idZone, idTurn, option, turnZoneAdd, turnForm, zoneSelected, listAvailability) {
                var defered = $q.defer();
                var self = this;

                var tablesZoneExists = self.searchZoneByZoneAdd(turnZoneAdd.zonesTables, idZone);

                if (tablesZoneExists !== null) {
                    defered.resolve(tablesZoneExists.tables);
                } else {

                    self.addRulesTable(zoneSelected, turnZoneAdd);

                    if (option == "edit") {
                        TurnDataFactory.getTurnZoneTables(idZone, idTurn).success(function(data) {
                            var rulesTables = self.setAvailabilityText(data.data, turnForm, listAvailability);
                            defered.resolve(rulesTables);
                        }).error(function(data, status, headers) {
                            defered.reject(data);
                        });
                    } else {
                        ZoneFactory.getTables(idZone).success(function(data) {
                            data = self.checkRuleTableAll(data.data, 1, turnForm);
                            defered.resolve(data);
                        }).error(function(data, status, headers) {
                            defered.reject(data);
                        });
                    }
                }

                return defered.promise;
            },
            //Busca las reglas de las mesas y las añade para mostrar el texto de disponibilidad
            setAvailabilityText: function(tables, turnForm, listAvailability) {
                var self = this;

                angular.forEach(tables, function(data, key) {
                    var vData = {};
                    var rulesData = [];

                    for (var i = turnForm.hours_ini.index; i <= turnForm.hours_end.index; i++) {
                        var ruleId = self.getAvailabilityRuleId(data.availability, i);
                        var ruleIdOld = self.getAvailabilityRuleId(data.availability, i - 1);
                        var ruleIdNext = self.getAvailabilityRuleId(data.availability, i + 1);

                        if (ruleIdOld != ruleId || i == turnForm.hours_ini.index) {
                            vData.hours_ini = listAvailability[i].time;
                            vData.hours_end = vData.hours_ini;
                            vData.rule_id = ruleId;
                        } else if (ruleIdOld == ruleId) {
                            vData.hours_end = listAvailability[i].time;
                        }

                        if (ruleIdNext != ruleId || i == turnForm.hours_end.index) {
                            rulesData.push(vData);
                            vData = {};
                        }
                    }
                    data = self.setRuleTextTable(data, rulesData);
                });

                return tables;
            },
            //Asigna el texto de disponibilidad para la mesa 
            setRuleTextTable: function(table, rulesData) {
                var rulesTable = {
                    rulesDisabled: [],
                    rulesOnline: [],
                    rulesLocal: []
                };

                angular.forEach(rulesData, function(rules, key) {
                    var vData = rules.hours_ini + " - " + rules.hours_end;

                    switch (rules.rule_id) {
                        case 0:
                            rulesTable.rulesDisabled.push(vData);
                            break;
                        case 1:
                            rulesTable.rulesLocal.push(vData);
                            break;
                        case 2:
                            rulesTable.rulesOnline.push(vData);
                            break;
                    }
                });

                table.rules_disabled = rulesTable.rulesDisabled.toString();
                table.rules_local = rulesTable.rulesLocal.toString();
                table.rules_online = rulesTable.rulesOnline.toString();

                return table;
            },
            //Obtiene la regla establecida
            getAvailabilityRuleId: function(availability, index) {
                var ruleId = -1;
                ruleId = availability[index].rule_id;
                return ruleId;
            },
            //Busca la zona, entre las zonas agregadas al turno
            searchZoneByZoneAdd: function(zonesTablesAdd, idZone) {
                var tablesZone = null;

                angular.forEach(zonesTablesAdd, function(data, key) {
                    if (data.zone_id == idZone) {
                        tablesZone = data;
                    }
                });

                return tablesZone;
            },
            //Selecciona la mesa de la zona
            checkTableZone: function(tablesId, idTable) {
                var index = tablesId.indexOf(idTable);

                if (index == -1) {
                    tablesId.push(idTable);
                } else {
                    tablesId.splice(index, 1);
                }
            },
            //Selecciona todas las mesas de la zona
            checkAllTableZone: function(tablesId, tables, option) {
                if (option === true) {
                    tablesId.length = 0;
                }

                angular.forEach(tables, function(table, key) {
                    var index = tablesId.indexOf(table.id);
                    if (index == -1) {
                        tablesId.push(table.id);
                    } else {
                        tablesId.splice(index, 1);
                    }
                });
            },
            //Obtiene la mesa segun el id, busca entre un array de mesas
            getTableZoneTime: function(tables, idTable) {
                var data = "";

                angular.forEach(tables, function(table, key) {
                    if (table.id == idTable) {
                        data = table;
                    }
                });

                return data;
            },
            //Agrega la regla de forma temporal
            checkRuleTable: function(indexTime, rule, tableItem, rulesDataTemp) {

                var jsonData = angular.toJson(rulesDataTemp);

                if (rulesDataTemp.length === 0 || jsonData.indexOf(indexTime) == -1) {
                    rulesDataTemp.push({
                        rule_id: rule,
                        index_time: indexTime
                    });
                } else {
                    angular.forEach(rulesDataTemp, function(rules, key) {
                        if (rules.index_time == indexTime) {
                            rules.rule_id = rule;
                        }
                    });
                }
            },
            //Guarda la regla de la mesa
            saveRuleTable: function(tableItem, rulesDataTemp) {
                angular.forEach(tableItem, function(table, key) {
                    angular.forEach(table.availability, function(rules, key) {
                        angular.forEach(rulesDataTemp, function(rulesTemp) {
                            if (key == rulesTemp.index_time) {
                                rules.rule_id = rulesTemp.rule_id;
                            }
                        });
                    });
                });

                return tableItem;
            },
            //Genera la lista del tiempo segun hora inicio y hora final del turno
            listHour: function(hourIni, hourEnd, availabilityTime) {
                var listTime = [];

                angular.forEach(availabilityTime, function(value, key) {
                    if (value.index >= hourIni && value.index <= hourEnd) {
                        listTime.push({
                            time: value.time,
                            time_original: value.time_original,
                            index: value.index
                        });
                    }
                });

                return listTime;
            },
            //Genera un array de horas entre un intervalo de 15 minutos
            initAvailability: function() {
                var times = [];

                for (var i = 0; i < 120; i++) {
                    var time = i * 60 * 15;
                    var nextday = (i < 96) ? 0 : 1;

                    var time_original = moment.utc(time * 1000).format('HH:mm');

                    if (i >= 52 && i < 96) {
                        var a = (i - 48) * 60 * 15;
                        time = moment.utc(a * 1000).format('HH:mm') + " PM";
                    } else if (i < 52) {
                        time = moment.utc(time * 1000).format('HH:mm') + " AM";
                    } else {
                        time = moment.utc(time * 1000).format('HH:mm') + " AM";
                    }

                    times.push({
                        time: time,
                        time_original: time_original,
                        rule_id: "-1",
                        nextday: nextday,
                        index: i
                    });
                }

                return times;
            },
            //Asigna para todas las mesas la regla seleccionada
            checkRuleTableAll: function(tables, rule, turnForm) {
                var self = this;

                angular.forEach(tables, function(data) {
                    data = self.updateTextAvailabilityTable(data, rule, turnForm);
                    angular.forEach(data.availability, function(rules) {
                        rules.rule_id = rule;
                    });
                });

                return tables;
            },
            //Actualiza el texto de disponibilidad cuando elegimos una regla para todas las mesas
            updateTextAvailabilityTable: function(table, rule, turnForm) {
                table.rules_disabled = "";
                table.rules_local = "";
                table.rules_online = "";
                table.res_turn_rule_id = rule;

                switch (rule) {
                    case 0:
                        table.rules_disabled = turnForm.hours_ini.time + " - " + turnForm.hours_end.time;
                        break;
                    case 1:
                        table.rules_local = turnForm.hours_ini.time + " - " + turnForm.hours_end.time;
                        break;
                    case 2:
                        table.rules_online = turnForm.hours_ini.time + " - " + turnForm.hours_end.time;
                        break;
                }

                return table;
            },
            //Agrega la regla para la mesa(s)
            addRulesTable: function(zoneSelected, turnZoneAdd) {
                var vData = {
                    zone_id: zoneSelected.id,
                    res_turn_rule_id: zoneSelected.rule,
                    tables: []
                };

                angular.forEach(zoneSelected.tables, function(value, key) {
                    vData.tables.push(value);
                });

                if (turnZoneAdd.zonesTables.length === 0) {
                    turnZoneAdd.zonesTables.push(vData);
                } else {

                    var existeZone = 0;

                    angular.forEach(turnZoneAdd.zonesTables, function(value, key) {
                        if (value.zone_id == zoneSelected.id) {
                            turnZoneAdd.zonesTables.splice(key, 1);
                            turnZoneAdd.zonesTables.push(vData);

                            existeZone += 1;
                        }
                    });

                    if (existeZone === 0) {
                        turnZoneAdd.zonesTables.push(vData);
                    }
                }
            },
            //Verifica si existe una sola regla por defecto del turno
            ruleExitsOne: function(tables, ruleId, turnForm) {
                var rule = 1;

                angular.forEach(tables, function(table, key) {
                    for (var i = turnForm.hours_ini.index; i <= turnForm.hours_end.index; i++) {
                        if (table.availability[i].rule_id != ruleId) {
                            rule += 1;
                        }
                    }
                });

                return rule;
            },
            //Guarda el dia que se halla marcado
            checkDay: function(days, dayId) {
                var index = days.indexOf(dayId);

                if (index == -1) {
                    days.push(dayId);
                } else {
                    days.splice(index, 1);
                }
            },
            //Formatea datos del tiempo turno para su visualización 
            parseTurnTimeDefault: function(dataTurnTime, listAvailability, data) {
                var timeDefault = [];
                var self = this;

                angular.forEach(data, function(time, key) {
                    var indexHour = getIndexHour(time.time, 0);
                    timeDefault.push({
                        text: (key === 0) ? "1 Invitado" : (key + 1) + " Invitados",
                        indexHour: indexHour,
                        hourText: listAvailability[indexHour].time_original
                    });
                });

                dataTurnTime.data_temporal = timeDefault;

                return dataTurnTime;
            },
            //Genera la lista de tiempo turno
            generatedTurnTimeDefault: function(listAvailability) {
                var indexHourDefault = 5;
                var turnTime = {
                    data_final: [],
                    data_temporal: []
                };

                for (var i = 0; i <= 9; i++) {
                    turnTime.data_temporal.push({
                        text: (i === 0) ? "1 Invitado" : (i + 1) + " Invitados",
                        indexHour: indexHourDefault,
                        hourText: listAvailability[indexHourDefault].time_original
                    });

                    turnTime.data_final.push({
                        num_guests: (i + 1),
                        time: listAvailability[indexHourDefault].time_original
                    });

                    indexHourDefault += 1;
                }
                return turnTime;
            }

        };

    });