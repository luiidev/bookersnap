angular.module('floor.controller', [])
	.controller('FloorCtrl', function($scope, $uibModal, FloorFactory) {
		var vm = this;
		vm.titulo = "Floor";
		//console.log(ZoneFactory);
		var getZones = function() {
			FloorFactory.listZones().then(function success(data) {
				vm.zonas = data;
				//console.log('Conexion: '+angular.toJson(data,true));
			}, function error(data) {
				messageErrorApi(data, "Error", "warning");
			});
		};
		getZones();

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
	.controller('DetailInstanceCtrl', function($scope, $modalInstance, content) {
		var vmd = this;
		vmd.itemReservations = content;
		console.log('Agregar otra clase' + angular.toJson(content, true));
		$scope.cancel = function() {
			$modalInstance.dismiss('cancel');
		};


	})

.controller('reservationController', function($scope) {
	var rm = this;

})

.controller('waitlistController', function($scope) {
	var wm = this;


})

.controller('serverController', function($scope, ServerFactory) {
	var sm = this;
	sm.servers = [];
	ServerFactory.getAllServer().then(function(response){
		sm.servers = response.data.data;
		console.log(sm.servers);
	});

});