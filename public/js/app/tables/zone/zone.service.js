angular.module('zone.service', [])
    .factory('ZoneFactory', function($http, ApiUrlMesas, HttpFactory) {
        var zones;
        return {
            getZones: function(vOptions, reload) {
                zones = HttpFactory.get(ApiUrlMesas + "/zones?" + vOptions, {}, zones, reload);
                return zones;
            },
            getZonesActivesByDate: function(vOptions, reload) {
                zones = HttpFactory.get(ApiUrlMesas + "/zones/activesByDate?" + vOptions, {}, zones, reload);
                return zones;
            },
            getZone: function(vId) {
                return $http.get(ApiUrlMesas + "/zones/" + vId);
            },
            createZone: function(vData) {
                return $http.post(ApiUrlMesas + '/zones', vData);
            },
            editZone: function(vData) {
                return $http.put(ApiUrlMesas + '/zones/' + vData.id, vData);
            },
            deleteZone: function(vId) {
                return $http.delete(ApiUrlMesas + '/zones/' + vId);
            },
            getTables: function(vId) {
                return $http.get(ApiUrlMesas + "/zones/" + vId + "/tables");
            }
        };

    })

.factory('ZoneLienzoFactory', function($document, TableFactory) {
    return {
        //Activa el tablero de mesas (seleccionar mesas)
        activarTablesItems: function(boxTables) {
            boxTables.item = false;
            boxTables.items = true;
            angular.element('.item-drag-table').removeClass('selected-table');
        },
        //Actualiza el header (total mesas,covers) cuando agregamos mesas
        updateHeaderZone: function(headerZone, itemTables) {
            headerZone.tables = itemTables.length;

            var minCovers = 0;
            var maxCovers = 0;

            angular.forEach(itemTables, function(data) {
                minCovers += parseInt(data.minCover);
                maxCovers += parseInt(data.maxCover);
            });

            headerZone.minCovers = minCovers;
            headerZone.maxCovers = maxCovers;
        },
        //Obtiene la posicion de la mesas cuando arrastramos
        positionTable: function(evt) {
            var offset = $("#lienzo").offset();

            var divPos = {
                left: evt.x - offset.left,
                top: evt.y - offset.top
            };

            var documentWidth = $document.width();
            var documentHeight = $document.height();

            var lienzoWidth = $(".lienzo").innerWidth();
            var lienzoHeight = $(".lienzo").innerHeight();

            var ContentX = (documentWidth - lienzoWidth) / 2;
            var ContentY = 145; //205
            var SizeObjectDrag = 75;

            var x = divPos.left - (SizeObjectDrag * 0.5) + (SizeObjectDrag / 2 - evt.element.centerX);
            var y = divPos.top - (SizeObjectDrag * 0.5) + (SizeObjectDrag / 2 - evt.element.centerX);

            x = x - x % 10;
            y = y - y % 10;

            var position = {
                x: x,
                y: y
            };

            return position;
        },
        //Rotacion del texto sobre la mesa
        changeRotationText: function(option, element, index) {

            var table = angular.element("#tb-item" + index);
            var rotate_actual = table[0].firstElementChild.classList[1];
            var rotate = rotate_actual || "top";

            switch (rotate_actual) {
                case 'top':
                    rotate = (option == "right") ? "right" : "left";
                    break;
                case 'left':
                    rotate = (option == "right") ? "top" : "bottom";
                    break;
                case 'bottom':
                    rotate = (option == "right") ? "left" : "right";
                    break;
                case 'right':
                    rotate = (option == "right") ? "bottom" : "top";
                    break;
            }

            angular.element(table[0].firstElementChild).removeClass(rotate_actual);
            element.rotate_text = rotate;
        },
        //Cambiar el nombre de la mesa
        changeNameTable: function(element, itemTables, texto) {
            var valida = false;
            angular.forEach(itemTables, function(value, key) {

                if (value.name == texto && value.name !== "") {
                    valida = true;
                    alertMultiple("Alerta:", "Ya existe este nombre", "danger", "fa fa-comments");
                }
            });

            if (valida === false) {
                element.name = texto;
            }
        }
    };
})

.factory('TableFactory', function() {
    return {
        getIdShape: function(label) {
            var id = "";

            switch (label) {
                case "round":
                    id = "1";
                    break;
                case "square":
                    id = "2";
                    break;
                case "recta":
                    id = "3";
                    break;
            }
            return id;
        },
        getIdSize: function(label) {
            var id = "";

            switch (label) {
                case "small":
                    id = "1";
                    break;
                case "medium":
                    id = "2";
                    break;
                case "large":
                    id = "3";
                    break;
            }

            return id;
        },
        getLabelShape: function(id) {
            var label = "";

            switch (id) {
                case 1:
                    label = "round";
                    break;
                case 2:
                    label = "square";
                    break;
                case 3:
                    label = "recta";
                    break;
            }
            return label;
        },
        getLabelSize: function(id) {
            var label = "";

            switch (id) {
                case 1:
                    label = "small";
                    break;
                case 2:
                    label = "medium";
                    break;
                case 3:
                    label = "large";
                    break;
            }

            return label;
        },
        getRotationText: function(id) {
            var label = "top";
            switch (id) {
                case 1:
                    label = "top";
                    break;
                case 2:
                    label = "right";
                    break;
                case 3:
                    label = "bottom";
                    break;
                case 4:
                    label = "left";
                    break;
            }
            return label;
        },
        getIdRotationText: function(label) {
            var id = 1;
            switch (label) {
                case 'top':
                    id = 1;
                    break;
                case 'right':
                    id = 2;
                    break;
                case 'bottom':
                    id = 3;
                    break;
                case 'left':
                    id = 4;
                    break;
            }
            return id;
        }
    };
})

;