angular.module('book.service', [])
.factory('BookFactory',function($http,ApiUrl){
	return {
		getBooks: function(vDate){
			// return $http.get(ApiUrl+"/book/"+vDate); 
		}
	};

})
.factory('BlockFactory',function($http,ApiUrl){
	return {
		getAllBlock: function(vDate){
				return $http.get(ApiUrl+"/blocks?"+vDate); 
		}
	};

})
.factory('BookDateFactory',function(){
	return {
		rangeDateAvailable: function(minSteep,turn){

			var iniHour = turn.hours_ini.split(":");
			var iniMin = turn.hours_ini.split(":");

			var endHour = turn.hours_end.split(":");
			var endMin = turn.hours_end.split(":");

			endHour = parseInt(endHour[0]);
			endMin = parseInt(endMin[1]);

			var hour = parseInt(iniHour[0]);
			var min = parseInt(iniMin[1]);

			var time = [];
	
			while(hour <= endHour){

				var sHorario = (hour <=12) ? "AM":"PM";

				var hora = hour +":"+ ((min == 0) ? "00" : min) + " " + sHorario
				time.push(hora);
				
				if(min == (60 - minSteep) ){
					hour += 1;
					min = 0;
				}else{
					if(hour == endHour && min == endMin){
						hour = 45;
					}
					min += minSteep;	
				}
					
			}

			return time;
		},
		getDate : function(language,options,date = null){
		 	var me = this;

		 	if(date != null){
		 		date = me.changeformatDate(date.toString());
		 		return new Date(date).toLocaleDateString(language, options);
		 	}else{
		 		return new Date().toLocaleDateString(language, options);
		 	}	
		},
		setDate : function (date,option){

			var me = this;

			var date = me.changeformatDate(date);

			var d = new Date(date);

			if(option == "+"){
				d.setDate(d.getDate() +  1);
			}else{
				d.setDate(d.getDate() -  1);
			}

			var dateFinal = me.getDate("es-ES",{},d);

			return dateFinal;
		},
		changeformatDate : function(date){

			var d = date.split("/");
			var dateFormat = d[2]+"-"+d[1] +"-"+d[0];

			return dateFormat;
		}

	};

})

;