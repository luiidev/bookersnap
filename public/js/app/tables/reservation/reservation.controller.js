angular.module('reservation.controller', [])
.controller("reservationCtrl.Index", [function(){

}])
.controller("reservationCtrl.Store", ["$scope", "ZoneFactory", "TableFactory", "ZoneLienzoFactory",
        function(vm, ZoneFactory, TableFactory, ZoneLienzoFactory){

    vm.itemTables = [];

    vm.headerZone = {
        tables: 0,
        minCovers: 0,
        maxCovers: 0
    };

    var updateHeaderZone = function() {
        ZoneLienzoFactory.updateHeaderZone(vm.headerZone, vm.itemTables);
    };

    var detectedForm = function() {
        // if ($stateParams.id !== undefined) {

            vm.typeForm = "edit";

            // loadingShow($ionicLoading, "Cargando información ...");

            var id = 1;

            ZoneFactory.getZone(id).success(function(zone) {
                // loadingHide($ionicLoading);

                console.log(zone);
                // angular.element("#zone_name").val(zone.data.name);
                loadTablesEdit(zone.data.tables);

            }).error(function(response) {

                // loadingHide($ionicLoading);
                message.apiError(response);

            });
        // }
    };

    var loadTablesEdit = function(tables) {

        angular.forEach(tables, function(data) {

            var position = data.config_position.split(",");
            var dataTable = {
                name: data.name,
                minCover: data.min_cover,
                maxCover: data.max_cover,
                left: position[0],
                top: position[1],
                shape: TableFactory.getLabelShape(data.config_forme),
                size: TableFactory.getLabelSize(data.config_size),
                rotate: data.config_rotation,
                id: data.id,
                status: data.status
            };

            if (data.status == 1) {
                vm.itemTables.push(dataTable);
            } else {
                vm.itemTablesDeleted.push(dataTable);
            }

        });

        updateHeaderZone();
    };

    detectedForm();
}]);