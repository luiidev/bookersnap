angular.module('configuration.service', [])
    .service('ConfigurationDataService', function($http, ApiUrlMesas) {
        return {
            getConfiguration: function() {
                return $http.get(ApiUrlMesas + "/configuration/reservations");
            },
            updateConfiguration: function(idMicrosite, configuration) {
                return $http.put(ApiUrlMesas + "/configuration/reservations/" + idMicrosite, {}, {
                    params: {
                        time_tolerance: configuration.time_tolerance,
                        time_restriction: configuration.time_restriction,
                        max_people: configuration.max_people,
                        max_people_standing: configuration.max_people_standing,
                        max_table: configuration.max_table,
                        res_code_status: configuration.res_code_status,
                        res_privilege_status: configuration.res_privilege_status,
                        messenger_status: configuration.messenger_status,
                        user_add: configuration.user_add,
                        user_upd: configuration.user_upd,
                        reserve_portal: configuration.reserve_portal,
                        res_percentage_id: configuration.res_percentage_id,
                        name_people_1: configuration.name_people_1,
                        name_people_2: configuration.name_people_2,
                        name_people_3: configuration.name_people_3,
                        status_people_1: configuration.status_people_1,
                        status_people_2: configuration.status_people_2,
                        status_people_3: configuration.status_people_3
                    }
                });
            },
            getListPercentage: function() {
                return $http.get(ApiUrlMesas + "/configuration/percentages");
            },
            getConfigurationCode: function() {
                return $http.get(ApiUrlMesas + "/configuration/codes");
            },
            storeConfigurationCode: function(idMicrosite, code) {
                return $http.post(ApiUrlMesas + "/configuration/codes", {}, {
                    params: {
                        code: code,
                        ms_microsite_id: idMicrosite,
                    }
                });
            },
            updateConfigurationCode: function(idCod, configuration) {
                return $http.put(ApiUrlMesas + "/configuration/codes/" + idCod, {}, {
                    params: {
                        code: configuration.code,
                        ms_microsite_id: idMicrosite,
                    }
                });
            },
            deleteConfigurationCode: function(idCod) {
                return $http.delete(ApiUrlMesas + "/configuration/codes/" + idCod);
            },
            updateCodeStatus: function(res_code_status) {
                return $http.patch(ApiUrlMesas + "/configuration/reservations", {}, {
                    params: {
                        res_code_status: res_code_status
                    }
                });
            },
            updatePrivilegeStatus: function(res_privilege_status) {
                return $http.patch(ApiUrlMesas + "/configuration/reservations", {}, {
                    params: {
                        res_privilege_status: res_privilege_status
                    }
                });
            },
        };

    })
    .service('ConfigurationDataUser', function($http, ApiUrlMesas) {
        return {
            getAllUser: function(search) {
                return $http.get(ApiUrlMesas + "/configuration/users/privileges/", {
                    params: {
                        search: search
                    }
                });
            },
            getAllPrivilegeUser: function() {
                return $http.get(ApiUrlMesas + "/configuration/users");
            },
            storePrivilegeUSer: function(idUser) {
                return $http.post(ApiUrlMesas + "/configuration/users", {}, {
                    params: {
                        user_id: idUser
                    }
                });
            },
            deletePrivilegeUSer: function(idUser) {
                return $http.delete(ApiUrlMesas + "/configuration/users/" + idUser);
            }
        };
    })
    .service('ConfigurationService', function($q, ConfigurationDataService, ConfigurationDataUser) {
        return {
            getConfig: function() {
                var defered = $q.defer();
                var promise = defered.promise;
                ConfigurationDataService.getConfiguration().success(function(data) {
                    data = data.data;
                    defered.resolve(data);
                }).error(function(data, status, headers) {
                    var response = jsonErrorData(data, status, headers);
                    defered.reject(response);
                });
                return promise;
            },
            updateConfig: function(idMicrosite, configuration) {
                var defered = $q.defer();
                var promise = defered.promise;
                ConfigurationDataService.updateConfiguration(idMicrosite, configuration).success(function(data) {
                    data = data.data;
                    defered.resolve(data);
                }).error(function(data, status, headers) {
                    var response = jsonErrorData(data, status, headers);
                    defered.reject(response);
                });
                return promise;
            },
            getPercentages: function() {
                var defered = $q.defer();
                var promise = defered.promise;
                ConfigurationDataService.getListPercentage().success(function(data) {
                    data = data.data;
                    defered.resolve(data);
                }).error(function(data, status, headers) {
                    var response = jsonErrorData(data, status, headers);
                    defered.reject(response);
                });
                return promise;
            },
            getCode: function() {
                var defered = $q.defer();
                var promise = defered.promise;
                ConfigurationDataService.getConfigurationCode().success(function(data) {
                    data = data.data;
                    defered.resolve(data);
                }).error(function(data, status, headers) {
                    var response = jsonErrorData(data, status, headers);
                    defered.reject(response);
                });
                return promise;
            },
            createCode: function(idMicrosite, code) {
                var defered = $q.defer();
                var promise = defered.promise;
                ConfigurationDataService.storeConfigurationCode(idMicrosite, code).success(function(data) {
                    data = data.data;
                    defered.resolve(data);
                }).error(function(data, status, headers) {
                    var response = jsonErrorData(data, status, headers);
                    defered.reject(response);
                });
                return promise;
            },
            updateCode: function(idCod, configuration) {
                var defered = $q.defer();
                var promise = defered.promise;
                ConfigurationDataService.updateConfigurationCode(idCod, configuration).success(function(data) {
                    data = data.data;
                    defered.resolve(data);
                }).error(function(data, status, headers) {
                    var response = jsonErrorData(data, status, headers);
                    defered.reject(response);
                });
                return promise;
            },
            deleteCode: function(idCod) {
                var defered = $q.defer();
                var promise = defered.promise;
                ConfigurationDataService.deleteConfigurationCode(idCod).success(function(data) {
                    data = data.data;
                    defered.resolve(data);
                }).error(function(data, status, headers) {
                    var response = jsonErrorData(data, status, headers);
                    defered.reject(response);
                });
                return promise;
            },
            updateCodeStatus: function(res_code_status) {
                var defered = $q.defer();
                var promise = defered.promise;
                ConfigurationDataService.updateCodeStatus(res_code_status).success(function(data) {
                    data = data.data;
                    defered.resolve(data);
                }).error(function(data, status, headers) {
                    var response = jsonErrorData(data, status, headers);
                    defered.reject(response);
                });
                return promise;
            },
            updatePrivilegeStatus: function(res_privilege_status) {
                var defered = $q.defer();
                var promise = defered.promise;
                ConfigurationDataService.updatePrivilegeStatus(res_privilege_status).success(function(data) {
                    data = data.data;
                    defered.resolve(data);
                }).error(function(data, status, headers) {
                    var response = jsonErrorData(data, status, headers);
                    defered.reject(response);
                });
                return promise;
            },
            getAllUser: function(search) {
                var defered = $q.defer();
                var promise = defered.promise;
                ConfigurationDataUser.getAllUser(search).success(function(data) {
                    data = data.data;
                    defered.resolve(data);
                }).error(function(data, status, headers) {
                    var response = jsonErrorData(data, status, headers);
                    defered.reject(response);
                });
                return promise;
            },
            getAllPrivilegeUser: function() {
                var defered = $q.defer();
                var promise = defered.promise;
                ConfigurationDataUser.getAllPrivilegeUser().success(function(data) {
                    data = data.data;
                    defered.resolve(data);
                }).error(function(data, status, headers) {
                    var response = jsonErrorData(data, status, headers);
                    defered.reject(response);
                });
                return promise;

            },
            storePrivilegeUser: function(idUser) {
                var defered = $q.defer();
                var promise = defered.promise;
                ConfigurationDataUser.storePrivilegeUSer(idUser).success(function(data) {
                    data = data.data;
                    defered.resolve(data);
                }).error(function(data, status, headers) {
                    var response = jsonErrorData(data, status, headers);
                    defered.reject(response);
                });
                return promise;

            },
            deletePrivilegeUser: function(idUser) {
                var defered = $q.defer();
                var promise = defered.promise;
                ConfigurationDataUser.deletePrivilegeUSer(idUser).success(function(data) {
                    data = data.data;
                    defered.resolve(data);
                }).error(function(data, status, headers) {
                    var response = jsonErrorData(data, status, headers);
                    defered.reject(response);
                });
                return promise;

            },
            initDataFakeList: function(cant, prefijo) {
                //Max cant de usuarios 1 -> 1000
                var list = [];
                for (var i = 0; i <= cant; i++) {
                    if (i != 1) {
                        list[i] = {
                            id: i,
                            option: i + " " + prefijo + "s"
                        };
                    } else {
                        list[i] = {
                            id: i,
                            option: i + " " + prefijo
                        };
                    }
                }
                return list;
            },
            initDataFakeHour: function() {
                var tolerancia = 0;
                var hora = 0;
                var timeList = [];
                for (var i = 0; i <= 36; i++) {
                    if (i == 0) {
                        timeList[i] = {
                            id: i,
                            option: "ILIMITADO"
                        };
                    } else if (i < 12) {
                        timeList[i] = {
                            id: i * 5,
                            option: tolerancia + " minutos"
                        };
                    } else {
                        resto = i % 12;
                        if (resto == 0) {
                            multiplo = true;
                        } else {
                            multiplo = false;
                        }
                        if (multiplo) {
                            hora++;
                            timeList[i] = {
                                id: i * 5,
                                option: hora + " horas"
                            };
                            tolerancia = 0;
                        } else {
                            timeList[i] = {
                                id: i * 5,
                                option: hora + " horas " + tolerancia + " minutos"
                            };
                        }
                    }
                    tolerancia = tolerancia + 5;
                }

                return timeList;
            }

        };
    });