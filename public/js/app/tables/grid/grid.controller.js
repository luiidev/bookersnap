angular.module('grid.controller', [])
    .controller('GridCtrl', function($scope, gridFactory) {
        var vm = this;

        vm.reservationCreate = {
            hourIni: '',
            hourEnd: '',
            index: null,
            timeTotal: []
        };

        vm.tempData = {
            hourIni: '',
            index: null
        };

        vm.tablesAvailability = [];

        var init = function() {
            getTablesAvailability();
            getTurnsActives();
        };

        vm.selectTimeReservationCreate = function(type, hour, index, posIni) {

            //console.log("selectTimeReservationCreate ", type, hourIni, index);
            if (type == "init") {
                vm.reservationCreate.hourIni = hour;
                vm.reservationCreate.index = index;
                vm.tempData.hourIni = hour;
                vm.tempData.index = index;

                angular.element(".cell-item" + index).css("transform", "translateX(" + posIni + "px)");
                angular.element(".cell-item" + index).css("display", "block");

                calculateQuarterHour(posIni);
            }

            if (type == "move" && index === vm.reservationCreate.index) {

                if ((vm.tempData.hourIni !== hour)) {
                    console.log("move", hour, posIni);
                    vm.tempData.hourIni = hour;
                    vm.tempData.index = index;
                    calculateQuarterHour(posIni);

                }
            }
            //console.log("end", angular.toJson(vm.reservationCreate, true));
            if (type === "end") {
                vm.reservationCreate.hourEnd = hour;
                calculateQuarterHour(posIni);

                //console.log("end", angular.toJson(vm.reservationCreate, true));

                vm.reservationCreate.hourIni = '';
                vm.reservationCreate.index = null;
                //vm.reservationCreate.timeTotal = [];
                // angular.element(".cell-item" + index).css("display", "none");
            }
        };

        vm.moveQuarterHour = function(value) {

            if (vm.tempData.hourIni !== value.hour && vm.tempData.index === value.index) {
                console.log("moveQuarterHour", value);
                calculateQuarterHour(value.posIni);
            }
            //calculateQuarterHour(posIni);
        };

        vm.moveQuarterUp = function() {
            alert("moveQuarterUp");
        };

        var calculateQuarterHour = function(posIni) {
            posIni = parseInt(posIni);

            var total = (posIni === 0) ? 0 : posIni / 62;
            total = (total === 0) ? 1 : total;

            var indexPos = getPosIni(posIni);
            if (indexPos === -1) {
                vm.reservationCreate.timeTotal.push({
                    posIni: posIni,
                    hour: vm.tempData.hourIni,
                    index: vm.tempData.index
                });
            } else {
                vm.reservationCreate.timeTotal.splice(indexPos, 1);
            }
        };

        var getPosIni = function(posIni) {
            var total = vm.reservationCreate.timeTotal.length;
            var index = -1;

            for (var i = 0; i < total; i++) {
                if (vm.reservationCreate.timeTotal[i].posIni === posIni) {
                    return i;
                }
            }
            return index;
        };

        var getTablesAvailability = function() {
            var params = "";

            gridFactory.getTablesAvailability(params).then(
                function success(response) {
                    vm.tablesAvailability = response.data;
                    //console.log("getTablesAvailability", angular.toJson(vm.tablesAvailability, true));
                },
                function error(response) {
                    console.error("getTablesAvailability", angular.toJson(response, true));
                }
            );
        };

        var getTurnsActives = function() {
            gridFactory.getTurnsActives("2016-12-17", true).then(
                function success(response) {
                    console.log("getTurnsActives", angular.toJson(response, true));
                },
                function error(response) {
                    console.error("getTurnsActives", angular.toJson(response, true));
                }
            );
        };

        init();

    });