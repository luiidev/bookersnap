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
;