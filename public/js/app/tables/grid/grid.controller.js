angular.module('grid.controller', [])
    .controller('GridCtrl', function($scope) {
        var vm = this;

        vm.hourIni = "";

        var init = function() {
            $(".selectable").selectable();
        };

        vm.initReservationCreate = function(hour_ini) {
            console.log("initReservationCreate " + hour_ini);
            vm.hourIni = hour_ini;
        };

        vm.selectTimeReservationCreate = function() {
            if (vm.hourIni !== "") {
                console.log("selectTimeReservationCreate");
            }
        };

        init();

    });