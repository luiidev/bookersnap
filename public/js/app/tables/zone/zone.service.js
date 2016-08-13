angular.module('zone.service', [])
.factory('ZoneFactory',function($http,ApiUrl){
	return {
		getZones: function(vData){
			return $http.get(ApiUrl+"/zones"); 
		},
		getZone : function(vId){
			return $http.get(ApiUrl+"/zones/"+vId); 
		},
		createZone : function(vData){
			return $http.post(ApiUrl + '/zones',vData); 
		},
		editZone : function(vData){
			return $http.put(ApiUrl + '/zones/'+vData.id,vData); 
		},
		deleteZone : function(vId){
			return $http.delete(ApiUrl + '/zones/'+vId); 
		}
	};

})

.factory('ZoneTurnFactory',function($http,ApiUrl){
	
	/*return {
		create : function(vData){

		}
	}*/
})

.factory('ZoneLienzoFactory',function(){
	return {
		activarTablesItems : function(boxTables){
			boxTables.item = false;
			boxTables.items = true;

			angular.element('.item-drag-table').removeClass('selected-table');
		},
		updateHeaderZone : function(headerZone,itemTables){
			headerZone.tables = itemTables.length;

			var minCovers = 0;
			var maxCovers = 0;

			angular.forEach(itemTables,function(data){

				minCovers += parseInt(data.minCover);
				maxCovers += parseInt(data.maxCover);

			});

			headerZone.minCovers = minCovers;
			headerZone.maxCovers = maxCovers;
		}
	}
})

.factory('TableFactory',function(){
	return {
		getIdShape : function(label){
			var id = "";

			switch(label) {
				case "round":
					id = "1";
				break;
				case "square":
					id = "2";
				break;
				case "recta":
					id = "3";
				break;
			}
			return id;
		},
		getIdSize : function(label){
			var id = "";

			switch(label) {
				case "small":
					id = "1";
				break;
				case "medium":
					id = "2";
				break;
				case "large":
					id = "3";
				break;
			}

			return id;
		},
		getLabelShape : function(id){
			var label = "";

			switch(id) {
				case 1:
					label = "round";
				break;
				case 2:
					label = "square";
				break;
				case 3:
					label = "recta";
				break;
			}
			return label;
		},
		getLabelSize : function(id){
			var label = "";

			switch(id) {
				case 1:
					label = "small";
				break;
				case 2:
					label = "medium";
				break;
				case 3:
					label = "large";
				break;
			}

			return label;
		}
	}
})

;