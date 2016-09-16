angular.module('floor.controller', [])
	.controller('FloorCtrl', function($uibModal, $rootScope, FloorFactory, ServerFactory) {
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

		ServerFactory.getAllServer().then(function(response) {
			$rootScope.servers = response.data.data;
		});

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

.controller('serverController', function($scope, $rootScope, ServerFactory, ColorFactory) {
	console.log($rootScope.servers);
	var sm = this;
	//$rootScope.servers = [];
	sm.tables = [{
		id: 1
	}, {
		id: 2
	}, {
		id: 3
	}, {
		id: 4
	}, {
		id: 5
	}]; // El array ingresa de la lista de pruebas
	sm.flagServer = false;
	sm.data = [];

	console.log($rootScope.servers);

	sm.colors = ColorFactory.getColor();

	sm.selectColor = function(color) {

		sm.color = color.colorHexadecimal;
		var position = sm.colors.indexOf(color);
		for (var i = 0; i < sm.colors.length; i++) {
			sm.colors[i].classSelect = "";
		}
		sm.colors[position].classSelect = "is-selected";

	};

	sm.editServer = function(server) {

		sm.flagServer = true;
		var position = $rootScope.servers.indexOf(server);
		sm.server = $rootScope.servers[position];
		sm.name = sm.server.name;

		for (var i = 0; i < sm.colors.length; i++) {
			sm.colors[i].classSelect = "";
			if (sm.colors[i].colorHexadecimal == $rootScope.servers[position].color) {
				sm.color = $rootScope.servers[position].color;
				sm.colors[i].classSelect = "is-selected";
			}
		}

	};

	var limpiarData = function() {

		sm.name = "";
		sm.color = "";
		for (var i = 0; i < sm.colors.length; i++) {
			sm.colors[i].classSelect = "";
		}

	};

	sm.saveOrUpdateServer = function() {

		if (sm.flagServer == false) {

			sm.data = {
				name: sm.name,
				color: sm.color,
				tables: sm.tables
			};

			ServerFactory.addServer(sm.data).then(function(response) {

				if (response.data.response == false) {
					var mensaje = setearJsonError(response.data.jsonError);
					messageAlert("Warning", mensaje, "warning", 3000);
				} else if (response.data.success == true) {
					console.log("Se crea el server");
					var mensaje = response.data.msg;
					messageAlert("success", mensaje, "success", 3000);
					$rootScope.servers.push(response.data.data);
					limpiarData();
				}

			});

		} else if (sm.flagServer == true) {

			sm.data = {
				id: sm.server.id,
				name: sm.name,
				color: sm.color,
				tables: sm.tables
			};

			ServerFactory.updateServer(sm.data, sm.server.id).then(function(response) {
				console.log(response);

				if (response.data.response == false) {
					var mensaje = setearJsonError(response.data.jsonError);
					messageAlert("Warning", mensaje, "warning", 3000);
				} else if (response.data.success == true) {
					var mensaje = response.data.msg;
					sm.server.name = sm.name;
					sm.server.color = sm.color;
					messageAlert("success", mensaje, "success", 3000);
					sm.flagServer = false;
					limpiarData();
				} else if (response.data.success == false) {
					var mensaje = response.data.msg;
					messageAlert("Warning", mensaje, "warning", 3000);
				}

			});

		}
	}

	sm.cancelEditServer = function(server) {
		sm.flagServer = false;
		limpiarData();
	};

	sm.deleteServer = function() {

		ServerFactory.deleteServer(sm.server.id).then(function(response) {

			if (response.data.response == false) {
				var mensaje = setearJsonError(response.data.jsonError);
				messageAlert("Warning", mensaje, "warning", 2000);
			} else if (response.data.success == true) {
				var mensaje = response.data.msg;

				/* Se filtra el item y se elimina del array*/
				for (var i = 0; i < $rootScope.servers.length; i++) {
					if ($rootScope.servers[i].id == sm.server.id) {
						$rootScope.servers.splice(i, 1);
					}
				}

				messageAlert("success", mensaje, "success", 1000);
				sm.flagServer = false;
				limpiarData();
			} else if (response.data.success == false) {
				var mensaje = response.data.msg;
				messageAlert("Warning", mensaje, "warning", 2000);
			}
		});

	};

});