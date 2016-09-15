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

.controller('serverController', function($scope, ServerFactory, ColorFactory) {

	var sm = this;
	sm.servers = [];
	sm.tables = [{id:1},{id:2},{id:3},{id:4},{id:5}]; // El array ingresa de la lista de pruebas
	sm.flagServer = false; 
	sm.data = [];
	/*
	ServerFactory.getAllServer().then(function(response){
		sm.servers = response.data.data;
	});

	sm.colors= ColorFactory.getColor();

	sm.selectColor =  function(color){

		sm.color = color.colorHexadecimal;
		var position = sm.colors.indexOf(color);
		for(var i=0; i < sm.colors.length; i++) {
			sm.colors[i].classSelect = "";	
		}
		sm.colors[position].classSelect = "is-selected";

	};

	sm.editServer =  function(server){

		sm.flagServer = true;
		var position=sm.servers.indexOf(server);
		sm.server = sm.servers[position];
		sm.server.name = sm.server.name;

		for(var i=0; i < sm.colors.length; i++){
			sm.colors[i].classSelect = "";
			if(sm.colors[i].colorHexadecimal == sm.servers[position].color){
				sm.color = sm.servers[position].color;
				sm.colors[i].classSelect = "is-selected";
			}
		}

	};

	var limpiarData = function(){

		sm.server.name = "";
		for(var i=0; i < sm.colors.length; i++){
			sm.colors[i].classSelect = "";
		}

	};

	sm.saveOrUpdateServer = function(){

		if(sm.flagServer == false){

			sm.data = {
				name : sm.server.name,
				color : sm.color,
				tables: sm.tables
			};
			
			ServerFactory.addServer(sm.data).then(function(response){

				if(response.data.response == false){
					var mensaje = setearJsonError(response.data.jsonError);
					messageAlert("Warning", mensaje,"warning", 3000);
				}else if(response.data.success == true) {
					var mensaje = response.data.msg;
					messageAlert("success", mensaje,"success", 3000);
					sm.servers.push(response.data.data);
					limpiarData();
				}

			});

		}else if(sm.flagServer == true){
			
			console.log(sm.server);
			
			sm.data = {
				id : sm.server.id,
				name : sm.server.name,
				color : sm.color,
				tables: sm.tables
			};
			
			ServerFactory.updateServer(sm.data, sm.server.id).then(function(response){

				if(response.data.response == false){
					var mensaje = setearJsonError(response.data.jsonError);
					messageAlert("Warning", mensaje,"warning", 3000);
				}else if(response.data.success == true) {
					var mensaje = response.data.msg;
					messageAlert("success", mensaje,"success", 3000);
					sm.servers.push(response.data.data);
					limpiarData();
				}

			});
			
		}
	}

	sm.cancelEditServer =  function(server){

		sm.flagServer = false;
		limpiarData();

	};
	*/
});