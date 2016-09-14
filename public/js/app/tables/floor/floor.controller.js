angular.module('floor.controller', [])
	.controller('FloorCtrl', function($uibModal, FloorFactory) {
		var vm = this;
		vm.titulo = "Floor";
		var getZones = function() {
			FloorFactory.listZones().then(function success(data) {
				vm.zonas = data;
				//console.log('Formateado: ' + angular.toJson(data, true));
			}, function error(data) {
				messageErrorApi(data, "Error", "warning");
			});
		};
		getZones();
		/*
		var getZonesReservation = function() {
			FloorFactory.listZonesReservation().then(function success(data) {
				vm.zonas = data;
				//console.log('Formateado: ' + angular.toJson(data, true));
			});
		};
		getZonesReservation();
		*/
		vm.mostrarDetail = function(index, data) {
			modalInstancesDetail(index, data);
		};

		function modalInstancesDetail(index, data) {
			var modalInstance = $uibModal.open({
				templateUrl: 'myModalContentDetail.html',
				controller: 'DetailInstanceCtrl',
				controllerAs: 'vmd',
				size: '',
				resolve: {
					content: function() {
						return data;
					}
				}
			});
		}

	})
	.controller('DetailInstanceCtrl', function($scope, $modalInstance, content, FloorFactory) {
		var vmd = this;
		vmd.itemZona = {
			name_zona: content.name_zona,
			name: content.name
		};

		var getTableReservation = function() {
			FloorFactory.listTableReservation(content.table_id).then(function success(data) {
				vmd.itemReservations = data;
				//console.log(angular.toJson(data, true));
			});
		};
		getTableReservation();

		/*if (content.block_id || content.reservation_id) {

			if (content.reservation_id) {
				console.log('res');
				vmd.itemReservations = content;
			}
			if (content.block_id) {
				console.log(content);
				vmd.itemBlocked = content;
			}
		} else {
			console.log('not');
		}*/
		//console.log('Agregar otra clase' + angular.toJson(content, true));
		$scope.cancel = function() {
			$modalInstance.dismiss('cancel');
		};


	})

.controller('reservationController', function(FloorFactory) {
	var rm = this;

	var getlistReservation = function() {
		FloorFactory.listReservation().then(function success(data) {
			rm.listado = data;
			//console.log(angular.toJson(data, true));
		});
	};
	getlistReservation();

})

.controller('waitlistController', function($scope) {
	var wm = this;


})

.controller('serverController', function($scope) {
	var sm = this;

});