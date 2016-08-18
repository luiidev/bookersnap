angular.module('guest.service', [])
.factory('GuestDataFactory',function($http,ApiUrl,ApiUrlRoot){
	return {
		getAllGuest : function(){
			return $http.get(ApiUrl+"/guests");
		},
		getAllTags : function(){
			return $http.get(ApiUrl+"/guests/tags");
		}
	}

})

.factory('GuestFactory',function($http,$q,GuestDataFactory){
	return {
		guestList : function(){
			var guestAll = [];
			var defered = $q.defer();  

			GuestDataFactory.getAllGuest().success(function(data){

				data = data.data.data;

				angular.forEach(data, function(value, key){
	
					if (value.phones.length == 0 && value.emails.length == 0) {
						value.contact = "sin telefono / correo";
					}else{
						if(value.phones.length > 0){
							value.contact = value.phones[0].number;
						}
						if(value.emails.length > 0){
							value.contact = value.emails[0].email;
						}
					}

					guestAll.push(value);
				});

				defered.resolve(guestAll);

			}).error(function(data,status,headers){
				defered.reject(data); 
			});

			return defered.promise;
		},
		getTabSelected : function(tabItem){
			var contentTab = {};
			if (tabItem == 1) {
				contentTab.active = "datos.html";
				contentTab.tab1 = "active";
				contentTab.tab2 = "";
				
			}

			if (tabItem == 2) {
				contentTab.active = "datos-contact.html";
				contentTab.tab1 = "";
				contentTab.tab2 = "active";
			}
			
			return contentTab;
		},
		insertDataContact : function(elements , element , type){

			var jsonData = JSON.stringify(elements);

			if(element != undefined){
				console.log(jsonData);
				if(jsonData.indexOf(element) == -1){
					elements.push({data : element });
				}else{
					messageAlert("Alerta","El "+type+" ya ha sido agregado","info");
				}
			}else{
				messageAlert("Alerta","El "+type+" no es correcto","info");
			}
			return elements;
		},
		existsTag : function(tagList,tag){
			var index = null;

			angular.forEach(tagList, function(value, key){
				if(value.id == tag){
					index = key;
				}
			});

			return index;
		}
	}
})

;