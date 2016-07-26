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
.controller('ZoneCreateCtrl', function($scope,$stateParams,ZoneFactory,ZoneLienzoFactory,TableFactory,$uibModal) {

	$scope.sizeTableList = {
		data : [
			{id : "1",label : "small"},
			{id : "2",label : "medium"},
			{id : "3",label : "large"}
		],
		selectedOption : {id : "1",label : "small"}
	} 

	$scope.coversList = {
		dataMin : [],
		selectedMin : '',
		dataMax : [],
		selectedMax : ''
	}

	$scope.headerZone = {
		tables : 0,
		minCovers : 0,
		maxCovers : 0
	}

	$scope.itemTables = [];

	$scope.boxTables = {
		items : true,
		item : false
	}

	$scope.typeDrag = "";

	$scope.indexTable = 0;

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

		console.log(shape);

		angular.element(".text-rotate .btn-group .shape").removeClass("active");
		angular.element(".shape."+shape+"s").addClass("active");
	};

	$scope.changeSizeTable = function(){
		$scope.itemTables[$scope.indexTable].size = $scope.sizeTableList.selectedOption.label;
	};

	$scope.editNameTable = function(){
		$scope.itemTables[$scope.indexTable].name = angular.element("#name-table").val();
	};

	$scope.tableCapacity = function(option){
		
		if (option == "min") {
			$scope.itemTables[$scope.indexTable].minCover = $scope.coversList.selectedMin.id;
		}else{

			$scope.itemTables[$scope.indexTable].maxCover = $scope.coversList.selectedMax.id;
		}

		if ($scope.coversList.selectedMax.id < $scope.coversList.selectedMin.id) {

			$scope.itemTables[$scope.indexTable].minCover = $scope.coversList.selectedMax.id;
			$scope.itemTables[$scope.indexTable].maxCover = $scope.coversList.selectedMax.id;

			getDataTableSelected($scope.indexTable);
		}

		updateHeaderZone();
	};

	$scope.rotateShapeTable = function(){
		
		console.log("rotateShapeTable " , $scope.itemTables[$scope.indexTable].rotate);
		if($scope.itemTables[$scope.indexTable].rotate == "0"){
			$scope.itemTables[$scope.indexTable].rotate = "45";	
		}else{
			$scope.itemTables[$scope.indexTable].rotate = "0";
		}	
	};

	$scope.activarTableOptions = function(index,vthis){
	
		getDataTableSelected(index);

		$scope.$apply(function(){

			$scope.boxTables.item = true;
			$scope.boxTables.items = false;

		});
	};

	$scope.doneTableSelected = function(){
		$scope.activarTablesItems();
	};

	var listCovers = function(option){

		var coverList = "";

		if (option == "min") {
			coverList = $scope.coversList.dataMin;
		}else{
			coverList = $scope.coversList.dataMax;
		}

		for (var i = 1; i <=30; i++) {
			var data = {
				label : i+" covers",
				id : i
			}

			coverList.push(data);
		}

		if (option == "min") {
			$scope.coversList.selectedMin = coverList[0];
		}else{
			$scope.coversList.selectedMax = coverList[0];
		} 
	};

	var getDataTableSelected = function(index){
		$scope.indexTable = index;

		angular.element("#name-table").val($scope.itemTables[index].name);
		$scope.changeShapeTable($scope.itemTables[index].shape);

		$scope.itemTables[index].top = angular.element("#tb-item"+index).css("top").replace("px","");
		$scope.itemTables[index].left = angular.element("#tb-item"+index).css("left").replace("px","");

		$scope.coversList.selectedMin = {
			id :$scope.itemTables[$scope.indexTable].minCover,
			label : $scope.itemTables[$scope.indexTable].minCover +" covers"
		};

		$scope.coversList.selectedMax = {
			id :$scope.itemTables[$scope.indexTable].maxCover,
			label : $scope.itemTables[$scope.indexTable].maxCover +" covers"
		};
		
		$scope.sizeTableList.selectedOption = {
			id : TableFactory.getIdSize($scope.itemTables[index].size),
			label : $scope.itemTables[index].size
		};
	};

	$scope.activarTablesItems = function(){
		ZoneLienzoFactory.activarTablesItems($scope.boxTables);
	};

	$scope.deleteSelectTableItem = function(){

		var modalDeleteTable = $uibModal.open({
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
				},
				headerZone : function(){
					return $scope.headerZone;
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
			updateHeaderZone();
	};

	var updateHeaderZone = function(){
		ZoneLienzoFactory.updateHeaderZone($scope.headerZone,$scope.itemTables);
	};

	$scope.saveNewZone = function(){
		var dataZone = {
			name : angular.element("#zone_name").val(),
			tables :[]
		}

		angular.forEach($scope.itemTables,function(table){

			var tableItem = {
				name : table.name,
				min_cover : table.minCover,
				max_cover : table.maxCover,
				config_position : table.left+","+table.top,//x,y
				config_size : TableFactory.getIdSize(table.size),
				config_rotation : table.rotate,
				config_forme : TableFactory.getIdShape(table.shape)
			}

			dataZone.tables.push(tableItem);

		});
		console.log("saveNewZone " , JSON.stringify(dataZone));
	};

	var detectedAction = function(){
		if ($stateParams.id != undefined) {

			console.log("params edit" ,$stateParams.id);

			var Zone = ZoneFactory.getZone($stateParams.id).success(function(zone){

				loadTablesEdit(zone.tables)
				
			});
		}
	};

	var loadTablesEdit = function(tables){

		angular.forEach(tables,function(data){
			var position = data.config_position.split(",");
			var data = {
				name : data.name,
				minCover : data.min_cover,
				maxCover : data.max_cover,
				left : position[0],
				top : position[1],
				shape : TableFactory.getLabelShape(data.config_forme),
				size : TableFactory.getLabelSize(data.config_size),
				rotate : data.config_rotation
			}

			$scope.itemTables.push(data);
		});

		updateHeaderZone();
	};
	
	detectedAction();

	listCovers("min");
	listCovers("max");
         
})
.controller('ModalTableDeteleCtrl', function($scope,$uibModalInstance,itemTables,indexTable,boxTables,headerZone,ZoneLienzoFactory) {

	$scope.ok = function () {
		//show tables items
		ZoneLienzoFactory.activarTablesItems(boxTables);

		//delete item table selected
		itemTables.splice(indexTable,1);
		angular.element('.item-drag-table').removeClass('selected-table');

		ZoneLienzoFactory.updateHeaderZone(headerZone,itemTables);

		$uibModalInstance.close();
	};

	$scope.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};

})

;
