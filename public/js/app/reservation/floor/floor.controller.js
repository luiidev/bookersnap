
angular.module('floor.controller', [])
.controller('FloorCtrl', function($scope,FloorFactory) {
	var vm = this;
	vm.titulo="Floor";
	//console.log(ZoneFactory);
	var getTest= function(){
		FloorFactory.listZones().then(function success(data){
			vm.zonas=data;
      		console.log('Conexion: '+angular.toJson(data,true));
    	},function error(data){
      		messageErrorApi(data,"Error","warning");
    	});
  	};
	getTest();

})
