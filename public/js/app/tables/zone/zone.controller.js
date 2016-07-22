angular.module('zone.controller', ['ngDraggable'])

.controller('ZoneCtrl', function($scope,ZoneFactory) {

	$scope.zonesActive = {};
	$scope.zonesInactive = {};

	$scope.getZones = function(){

		ZoneFactory.getZones().success(function(data){
			
			var vZonesActive = [];
			var vZonesInactive = [];
			
			angular.forEach(data, function(zones) {

				var zonesTables = getTablesCount(zones);

				if (zones.status == "0" || zones.status == "2") {
					vZonesInactive.push(zonesTables);
				}else{
					vZonesActive.push(zonesTables);
				}
				
			});

			$scope.zonesActive = vZonesActive;
			$scope.zonesInactive = vZonesInactive;
		});
	};

	var getTablesCount = function(zones){
		var vTables = 0;

		angular.forEach(zones.tables, function(tables) {
			vTables + = 1;
		});

		zones.tables_count = vTables;

		return zones;
	};

	$scope.getZones();
})
.controller('ZoneCreateCtrl', function($scope,ZoneFactory,$uibModal) {

	$scope.sizeTableList = {
		data : [
			{id : "1",label : "small"},
			{id : "2",label : "medium"},
			{id : "3",label : "large"}
		],
		selectedOption : {id : "1",label : "small"}
	} 

	$scope.itemTables = [];

	$scope.boxTables = {
		items : true,
		item : false
	}

	$scope.typeDrag = "";

	$scope.indexTable = 0;

	var modalDeleteTable = null;

	$scope.centerAnchor = true;

	$scope.toggleCenterAnchor = function () {
		$scope.centerAnchor = !$scope.centerAnchor
	};

	/*Si queremos llamar a una funcion desde directiva*/
	this.alertaPrueba = function(){
	};

	$scope.onDragComplete=function(data,evt,type){
		//console.log("drag success tipo :"+ type);
		$scope.typeDrag = type;
		selectTableTypeDrag(data,type);
	};

	$scope.onDropComplete = function(data,evt){
		selectTableTypeDrop(data);
		$scope.typeDrag = "";
	};

	$scope.changeShapeTable = function(shape){
		$scope.itemTables[$scope.indexTable].shape = shape;

		angular.element(".text-rotate .btn-group .shape").removeClass("active");
		angular.element(".shape."+shape+"s").addClass("active");
	};

	$scope.changeSizeTable = function(){
		console.log("changeSizeTable " + JSON.stringify($scope.sizeTableList.selectedOption));
		$scope.itemTables[$scope.indexTable].size = $scope.sizeTableList.selectedOption.label;
	};

	$scope.rotateShapeTable = function(){
		
		console.log("rotateShapeTable " , $scope.itemTables[$scope.indexTable].rotate);
		if($scope.itemTables[$scope.indexTable].rotate == "0"){
			$scope.itemTables[$scope.indexTable].rotate = "45";	
		}else{
			$scope.itemTables[$scope.indexTable].rotate = "0";
		}	
	};

	$scope.activarTableOptions = function(index,type){
		//Renderiza de nuestra directiva
		getDataTableSelected(index,type);

		$scope.$apply(function(){

			/*if ($scope.boxTables.item) {
				$scope.boxTables.item = false;
				$scope.boxTables.items = true;
			}else{*/
				$scope.boxTables.item = true;
				$scope.boxTables.items = false;
			//}
			
		});
	};

	$scope.saveTableSelected = function(){
	
		$scope.itemTables[$scope.indexTable].name = angular.element("#name-table").val();
		$scope.itemTables[$scope.indexTable].rotate = "12";

		$scope.activarTablesItems();

		console.log("saveTableSelected " , JSON.stringify($scope.itemTables[$scope.indexTable]) );
	};

	var getDataTableSelected = function(index,type){
		$scope.indexTable = index;

		angular.element("#name-table").val($scope.itemTables[index].name);
		$scope.changeShapeTable($scope.itemTables[index].shape);

		$scope.sizeTableList.selectedOption = {
			id : getIdSize($scope.itemTables[index].size),
			label : $scope.itemTables[index].size
		};

		console.log("index" + index ," type " + type , "element ", $scope.itemTables[index].name);
	};

	var getIdSize = function(label){
		var id = "";

		switch(label) {
			case "small":
				id = "1";
			break;
			case "medium":
				id = "2"
			break;
			case "large":
				id = "3"
			break;
		}
		return id;
	};

	$scope.activarTablesItems = function(){

		$scope.boxTables.item = false;
		$scope.boxTables.items = true;

	};

	$scope.deleteSelectTableItem = function(){

		modalDeleteTable = $uibModal.open({
			animation: true,
			templateUrl: 'myModalDeleteTable.html',
			size: 'lg',
			controller : 'ModalTableDeteleCtrl',
			resolve: {
				itemTables: function () {
					return $scope.itemTables;
				},
				indexTable : function(){
					return $scope.indexTable;
				},
				boxTables : function(){
					return $scope.boxTables;
				}
			}
		});
	};

	var selectTableTypeDrag = function(data){
		var index = $scope.itemTables.indexOf(data);
		if (index > -1) {
			$scope.itemTables.splice(index, 1);
		}
	};

	var selectTableTypeDrop = function(data){
		var index = $scope.itemTables.indexOf(data);
		if (index == -1)
			$scope.itemTables.push(data);
	};
         
})
.controller('ModalTableDeteleCtrl', function($scope,$uibModalInstance,itemTables,indexTable,boxTables) {

	$scope.ok = function () {
	    boxTables.item = false;
		boxTables.items = true;

		itemTables.splice(indexTable,1);

		angular.element('.item-drag-table').removeClass('selected-table');

		$uibModalInstance.close();
	};

	$scope.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};

})

;
