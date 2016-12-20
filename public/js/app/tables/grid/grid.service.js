angular.module('grid.service', [])
    .factory('gridDataFactory', function($http, $q, TablesDataFactory, FloorFactory, ApiUrlMesas) {

        return {
            getGrid: function(params) {
                return $http.get(ApiUrlMesas + "/web-app/grid", {
                    params: params
                });
            }
        };
    })
    .factory('gridFactory', function($q) {

        return {
            //Devuelve los turnos activos
            parseShiftsActives: function(data) {
                var shifts = [];

                angular.forEach(data, function(value, key) {
                    if (value.turn !== null) {
                        shifts.push(value);
                    }
                });

                return shifts;
            },
            //Asigna la propiedad active = true al turno seleccionado (disponible por la url)
            setActiveShiftSelected: function(shiftName, shifts) {
                var shiftData = null;

                angular.forEach(shifts, function(shift, key) {
                    if (shift.name === shiftName) {
                        shift.active = true;
                        shiftData = shift;
                    }
                });

                return shiftData;
            },
            getRangoHoursShift: function(shift) {
                var hours = getRangoHours(shift.turn.hours_ini, shift.turn.hours_end, true);
                console.log("getRangoHoursShift", angular.toJson(hours, true));
            }

        };
    });