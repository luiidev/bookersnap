angular.module('server.service', [])
    .factory('ServerFactory', function($http, HttpFactory, ApiUrlMesas, $q) {
        var servers;
        return {
            getAllTablesFromServer: function(reload) {
                servers = HttpFactory.get(ApiUrlMesas + "/servers", null, servers, reload);
                return servers;
            },
            addServer: function(data) {
                return $http({
                    url: ApiUrlMesas + "/servers",
                    method: "POST",
                    data: data
                });
            },
            updateServer: function(data, id_server) {
                return $http({
                    url: ApiUrlMesas + "/servers/" + id_server,
                    method: "PUT",
                    data: data
                });
            },
            deleteServer: function(id_server) {
                return $http({
                    url: ApiUrlMesas + "/servers/" + id_server,
                    method: "DELETE"
                });
            },
        };
    })
    .factory('ColorFactory', function() {
        return {
            getColor: function() {
                return [{
                    hex: "#9F7421"
                }, {
                    hex: "#82d1d3"
                }, {
                    hex: "#7c004c"
                }, {
                    hex: "#e176ce"
                }, {
                    hex: "#7e3c91"
                }, {
                    hex: "#b30011"
                }, {
                    hex: "#1e9084"
                }, {
                    hex: "#ffffe8"
                }, {
                    hex: "#eead00"
                }, {
                    hex: "#ff6138"
                }, {
                    hex: "#007fff"
                }, {
                    hex: "#ffc4b5"
                }, {
                    hex: "#a9d4ff"
                }, {
                    hex: "#30c6bd"
                }, {
                    hex: "#5fefe7"
                }, {
                    hex: "#ffc26b"
                }, {
                    hex: "#00aeef"
                }, {
                    hex: "#cdc3ff"
                }, {
                    hex: "#9be4ff"
                }, {
                    hex: "#aa0d71"
                }, {
                    hex: "#e891d7"
                }, {
                    hex: "#fc00ff"
                }, {
                    hex: "#901eac"
                }, {
                    hex: "#c41200"
                }, {
                    hex: "#ffffff"
                }, {
                    hex: "#2c3e50"
                }, {
                    hex: "#ab7714"
                }, {
                    hex: "#755e33"
                }, {
                    hex: "#83ff5a"
                }, {
                    hex: "#2085d8"
                }];
            },
        };
    });