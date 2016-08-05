angular.module('book.service', [])
.factory('BookFactory',function($http,ApiUrl){
	return {
		getBooks: function(vDate){
			//return $http.get(ApiUrl+"/book/"+vDate); 
		}

	};

})
.factory('BookDateFactory',function(){
	return {
		rangeDateAvailable: function(minSteep,turn){

			var iniHour = turn.hours_ini.substr(0,2);
			var iniMin = turn.hours_ini.substr(3,2);

			var endHour = parseInt(turn.hours_end.substr(0,2));
			var endMin = parseInt(turn.hours_end.substr(3,2));

			var hour = parseInt(iniHour);
			var min = parseInt(iniMin);

			var time = [];
	
			while(hour <= endHour){

				var sHorario = (hour <=12) ? "AM":"PM";

				time.push({time : hour +":"+ ((min == 0) ? "00" : min) + " " + sHorario});
				
				if(min == (60 - minSteep) ){
					hour + = 1;
					min = 0;
				}else{
					if(hour == endHour && min == endMin){
						hour = 45;
					}
					min + = minSteep;	
				}
					
			}

			return time;

		}

	};

})

;