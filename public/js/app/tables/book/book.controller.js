angular.module('book.controller', [])

.controller('BookCtrl', function($scope,BookFactory,BookDateFactory,TurnFactory,$uibModal) {

	$scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];

	$scope.book = { 
		time : '',
		date : BookDateFactory.getDate("es-ES", {weekday: "long", year: "numeric", month: "short",day: "numeric"})
	};

	$scope.calendarBtn = {
		dateText : BookDateFactory.getDate("es-ES", {weekday: "long", month: "short",day: "numeric"}),
		dateNumber : BookDateFactory.getDate("es-ES", {}),
		dateOptions : {formatYear: 'yy',startingDay: 1},
		dateFormat :  $scope.formats[0],
		dateCalendar : new Date(),
		clickArrow : null
	};

	$scope.timeAvailability = [];

	//Paginador Guest

	$scope.searchGuest = {
		totalItems : [1,2,3,4,5,6],
		//selected : 1,
		moreGuest : [],
		moreGuestSelected : '+'
	};

	$scope.$watch("calendarBtn.dateCalendar", function(newValue, oldValue) {

    	if($scope.calendarBtn.clickArrow == false){

    		var date = BookDateFactory.getDate("es-ES", {},$scope.calendarBtn.dateCalendar);

    		$scope.calendarBtn.dateText = BookDateFactory.getDate("es-ES", {weekday: "long", month: "short",day: "numeric"},date);
    		$scope.calendarBtn.dateNumber = date;

    		date = BookDateFactory.changeformatDate(date);

    		$scope.book.date = BookDateFactory.getDate("es-ES", {weekday: "long", year: "numeric", month: "short",day: "numeric"},date);
    		getTimeAvailability(date);
    	}

    	$scope.calendarBtn.clickArrow  = false;
	});

	$scope.setDate = function(option){
	
		var date = BookDateFactory.setDate($scope.calendarBtn.dateNumber,option);

		$scope.calendarBtn.dateText = BookDateFactory.getDate("es-ES", {weekday: "long", month: "short",day: "numeric"},date);
		$scope.calendarBtn.dateNumber = date;
        
        date = BookDateFactory.changeformatDate(date);
		$scope.calendarBtn.dateCalendar = date;

		$scope.calendarBtn.clickArrow = true;

		$scope.book.date = BookDateFactory.getDate("es-ES", {weekday: "long", year: "numeric", month: "short",day: "numeric"},date);

		getTimeAvailability(date);
	};

	$scope.openCalendar = function($event, opened) {
		$event.preventDefault();
		$event.stopPropagation();
		$scope[opened] = true;
	};

	$scope.newReservation = function(time){
		console.log("newReservation " + time);

		$scope.book.time = time;

		var modalNewReservation = $uibModal.open({
			animation: true,
			templateUrl: 'modalNewReservation.html',
			size: '',
			controller : 'modalNewReservationCtrl',
			resolve: {
				book : function(){
					return $scope.book;
				}
			}
		});
	};

	$scope.selectGuest = function(id,index,option){

		angular.element(".search-guest li").removeClass("active");
		
		if(option == "more"){
			$scope.searchGuest.moreGuestSelected = id;

			angular.element("#btn-more-guest").addClass("btn-info");

			angular.element(".guest-list li").removeClass("active");
			angular.element(".guest-list li").eq(index).addClass("active");

		}else{
			$scope.searchGuest.moreGuestSelected = '+';

			angular.element("#btn-more-guest").removeClass("btn-info");
			angular.element(".search-guest li").eq(index).addClass("active");
		}
	};

	var getTimeAvailability = function(vDate){

		TurnFactory.getTurnsAvailables(vDate).success(function(data,status){

			var times = [];
			var timesFinal = [];

			angular.forEach(data["data"], function(turn, key){
				times.push(BookDateFactory.rangeDateAvailable(15,turn));
			});

			angular.forEach(times, function(data, key){
				angular.forEach(data, function(value, key){
					var jsonValue = angular.toJson(timesFinal);
					
					if(jsonValue.indexOf(value.time) == -1){
						timesFinal.push(value);
					}
					
				});
			});

			$scope.timeAvailability = timesFinal;

		}).error(function(data,status,headers){

			messageAlert("Error",status,"warning");
			
		});
	};

	var listMoreGuest = function(){
		for (var i = 8; i <=20; i++) {
			var data = {
				label : i+" Guest",
				id : i
			}

			$scope.searchGuest.moreGuest.push(data);
		}
	};

	listMoreGuest();
	getTimeAvailability(BookDateFactory.changeformatDate($scope.calendarBtn.dateNumber));

})

.controller('modalNewReservationCtrl', function($scope,book,$uibModalInstance) {

	$scope.book = book;

   	$scope.create = function () {
   		$uibModalInstance.close();
   	};

   	$scope.moreDetails = function(){
   		$uibModalInstance.dismiss('cancel');
   	};
})
.controller('blockCtr', function($scope,$state,$stateParams,$document,ZoneFactory,ZoneLienzoFactory,TableFactory,$uibModal,IdMicroSitio) {

        ZoneFactory.getZones().success(function(response){
        	$scope.zones = response.data;
        });  

         // Se actualiza la vista cuando se selecciona la zona  
         $scope.selectZone = function(item){
         	$scope.typeForm = "edit";
                ZoneFactory.getZone(item.id).success(function(zone){
                	$scope.mesasBloqueadas = []; // Se limpia la variable de mesas bloqueadas
                	$scope.itemTables = []; // Se limpia la variable para imprimir los bloqueos
                    angular.element("#zone_name").val(zone.data.name);
                    loadTablesEdit(zone.data.tables)
                });
         };

        $scope.coversList = {
            dataMin : [],
            selectedMin : '',
            dataMax : [],
            selectedMax : ''
        }

        $scope.boxTables = {
            items : true,
            item : false
        }


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

        
		  /***************Funcion ejecutada por directiva****************/
		  $scope.mesasBloqueadas = [];
		  $scope.activarTableOptions = function(index,data){
		  	$scope.mesasBloqueadas.push(data.id);
		  };
		  
		  $scope.desactivarTable = function (index,data) {

		  	var item = $scope.mesasBloqueadas.indexOf(data.id);
		  	if(item > -1){
		  		$scope.mesasBloqueadas.splice(item, 1);
		  	}
		  }

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

        var getDataTables = function(table){

            var tableItem = {
                name : table.name,
                min_cover : table.minCover,
                max_cover : table.maxCover,
                config_position : table.left+","+table.top,//x,y
                config_size : TableFactory.getIdSize(table.size),
                config_rotation : table.rotate,
                config_forme : TableFactory.getIdShape(table.shape),
                id : table.id,
                status : table.status
            };

            return tableItem;

        };
        
        $scope.openCalendar = function($event, opened) {
			console.log("abrir");
			$event.preventDefault();
			$event.stopPropagation();
			$scope.opened = true;
		};

		$scope.object = [];
        $scope.saveZone = function(option){

        	var fecha = convertFechaYYMMDD($scope.fecha);

        	$scope.object= {
        				start_date: fecha,
        				start_time: convertDateTo24Hour($scope.startTime),
        				end_time: convertDateTo24Hour($scope.endTime),
        				tables: [],
        				}

        	for(var i=0; i<$scope.mesasBloqueadas.length; i++){
        		$scope.object.tables.push({id:$scope.mesasBloqueadas[i]});
        	}
        	
        	console.dir($scope.object);				

        	/*
            var dataZone = {
                name : angular.element("#zone_name").val(),
                ms_microsite_id : IdMicroSitio,
                tables : prepareDataTablesSave()
            }

            if (option == "create") {

                ZoneFactory.createZone(dataZone).success(function(response){
                    messageAlert("Success","Zone create complete","success");
                    $state.reload();
                }).error(function(data,status,headers){

                    messageErrorApi(data,"Error","warning");

                });

            }else{
                dataZone.id = $stateParams.id;
                ZoneFactory.editZone(dataZone).success(function(response){
                    messageAlert("Success","Zone edit complete","success");
                    $state.go('zone.active');
                }).error(function(data,status,headers){
                    messageErrorApi(data,"Error","warning");
                });
            }

            console.log("saveZone " + angular.toJson(dataZone,true));
            */
        };

        var detectedForm = function(){
            if ($stateParams.id != undefined) {

                $scope.typeForm = "edit";

                ZoneFactory.getZone($stateParams.id).success(function(zone){

                    angular.element("#zone_name").val(zone.data.name);

                    loadTablesEdit(zone.data.tables)
                });
            }
        };

        var loadTablesEdit = function(tables){

            angular.forEach(tables,function(data){

                var position = data.config_position.split(",");
                var dataTable = {
                    name : data.name,
                    minCover : data.min_cover,
                    maxCover : data.max_cover,
                    left : position[0],
                    top : position[1],
                    shape : TableFactory.getLabelShape(data.config_forme),
                    size : TableFactory.getLabelSize(data.config_size),
                    rotate : data.config_rotation,
                    id : data.id,
                    status : data.status
                }

                if(data.status == 1){
                    $scope.itemTables.push(dataTable);
                }else{
                    $scope.itemTablesDeleted.push(dataTable);
                }

            });

        };

        detectedForm();

        listCovers("min");
        listCovers("max");
    });