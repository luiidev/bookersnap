angular.module('reservation.controller', [])
.controller("reservationCtrl.Index", [function(){

}])
.controller("reservationCtrl.Store", ["$scope", "ZoneLienzoFactory", "$window", "reservationScreenHelper",
        "$stateParams", "reservationService", "reservationHelper",
        function(vm, ZoneLienzoFactory, $window, screenHelper, $stateParams, service, helper){

    vm.itemTables = [];
    vm.reservation = {};
    var zones = [];
    var zoneIndexMax = 0;
    var zoneIndex = 0;

    var listServers = function() {
        service.getServers()
            .then(function(response) {
                vm.servers = response.data.data;
            }).catch(function(error) {
                message.apiError(error);
            });
    };

    var listGuest = function() {
        service.getGuest()
            .then(function(guests) {
                vm.covers = guests;
                vm.reservation.covers = 2;
            });
    };

    var listStatuses = function() {
        service.getStatuses()
            .then(function(response) {
                vm.statuses = response.data.data;
                if (vm.statuses.length) vm.reservation.status_id = vm.statuses[0].id;
            }).catch(function(error) {
                message.apiError(error);
            });
    };

    var listDurations = function() {
        service.getDurations()
            .then(function(durations) {
                vm.durations = durations;
               vm.reservation.duration = "01:30:00";
            }).catch(function(error) {
                message.apiError(error);
            });
    };

    var listHours = function() {
        service.getHours()
            .then(function(data) {
                vm.hours = data.hours;
                console.log(data);
                vm.reservation.hour = data.default;
            }).catch(function(error) {
                message.apiError(error);
            });
    };

    vm.nextZone = function() {
        if (zoneIndexMax >= 0){
            if (zoneIndex + 1 > zoneIndexMax) {
                zoneIndex = 0;
            } else {
                zoneIndex++;
            }
        }

        vm.itemTables = zones[zoneIndex].tables;
        vm.zoneName = zones[zoneIndex].name;
    };

    vm.prevZone = function() {
        if (zoneIndexMax >= 0){
            if (zoneIndex - 1 >= 0) {
                zoneIndex --;
            } else {
                zoneIndex = zoneIndexMax ;
            }
        }

        vm.itemTables = zones[zoneIndex].tables;
        vm.zoneName = zones[zoneIndex].name;
    };

    var loadZones = function() {
            var date = $stateParams.date;
            var valid = moment(date , 'YYYY-MM-DD', true).isValid();

            if (!valid) {
                return alert("Fecha invalida");
            }

            service.getZones(date)
                .then(function(response) {
                    loadTablesEdit(response.data.data.zones);
                }).catch(function(error) {
                    message.apiError(error);
                });
    };

    var loadTablesEdit = function(dataZones) {
        zones = helper.loadTable(dataZones);
        zoneIndexMax =  zones.length - 1;
        defaultView();
    };

    var defaultView = function() {
        if (zoneIndexMax >= 0) {
            vm.itemTables = zones[0].tables;
            vm.zoneName = zones[0].name;
        }
    };

    angular.element($window).bind('resize', function(){
        var size = screenHelper.size(vm);
        vm.size = size;
        vm.$digest();
    });

    (function Init(){
        loadZones();
        listServers();
        listGuest();
        listStatuses();
        listDurations();
        listHours();

        vm.size = screenHelper.size();
    })();
}]);