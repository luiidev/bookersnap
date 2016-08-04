angular.module('book.controller', [])

.controller('BookCtrl', function($scope,BookFactory,BookDateFactory,TurnFactory,$uibModal) {

	$scope.dateOptions = {
		formatYear: 'yy',
		startingDay: 1
	};

	$scope.book = { 
		time : '',
		date : new Date().toLocaleDateString("es-ES", {weekday: "long", year: "numeric", month: "short",day: "numeric"})
	};

	$scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
	$scope.format = $scope.formats[0];

	//Paginador covers

	$scope.totalItems = 60;
	$scope.currentPage = 1;

	$scope.maxSize = 3;

	$scope.openCalendar = function($event, opened) {
		$event.preventDefault();
		$event.stopPropagation();
		$scope[opened] = true;
	};

	$scope.timeAvailability = [];

	var getTimeAvailability = function(vDate){
		TurnFactory.getTurnsAvailables(vDate).success(function(data){

			var times = [];
			var timesFinal = [];

			angular.forEach(data, function(turn, key){
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
			getTimeAvailability("2016-08-04");
		});
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

	getTimeAvailability("2016-08-04");

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
;