angular.module('guest.service', [])
.factory('GuestDataFactory',function($http,ApiUrlMesas,ApiUrlRoot){
	return {
		getAllGuest : function(){
			return $http.get(ApiUrlMesas+"/guests");
		},
		getAllTags : function(){
			return $http.get(ApiUrlMesas+"/guests/tags");
		},
		getGuest : function(idGuest){
			return $http.get(ApiUrlMesas+"/guests/"+idGuest);
		},
		create : function(vData){
			return $http.post(ApiUrlMesas+'/guests',vData); 
		},
		update : function(vData){
			return $http.put(ApiUrlMesas+'/guests/'+vData.id,vData); 
		},
		getReservations : function(idGuest,options){
			return $http.get(ApiUrlMesas+"/guests/"+idGuest+"/reservations?"+options);
		}
	}

})

.factory('GuestFactory',function($http,$q,GuestDataFactory){
	return {
		guestList : function(){
			var guestAll = [];
			var defered = $q.defer();  
			var me = this;

			GuestDataFactory.getAllGuest().success(function(data){

				data = data.data.data;

				angular.forEach(data, function(value, key){

					value.contact = me.parserContactData(value);

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
					var data = {email : element };

					if (type == "telefono") {
						data = {number : element };
					}

					elements.push(data);
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
		},
		createGuest : function(dataGuest){
			var defered = $q.defer();  

			console.log("saveGuest " + angular.toJson(dataGuest,true));

			GuestDataFactory.create(dataGuest).success(function(data){
				defered.resolve(data);
			}).error(function(data,status,headers){
				defered.reject(data); 
			});

			return defered.promise;
		},
		updateGuest : function(dataGuest){
			var defered = $q.defer();  

			GuestDataFactory.update(dataGuest).success(function(data){
				defered.resolve(data);
			}).error(function(data,status,headers){
				defered.reject(data); 
			});

			return defered.promise;
		},
		saveGuest : function(dataGuest,option){
			var defered = null;
			var me = this;

			if(option == "create"){
				defered = me.createGuest(dataGuest);
			}else{
				defered = me.updateGuest(dataGuest);
			}

			return defered;
		},
		getGuest : function(idGuest){
			var defered = $q.defer(); 

			GuestDataFactory.getGuest(idGuest).success(function(data){
				data = data.data;

				var guestData = {
					guest : {
						id : data.id,
						first_name : data.first_name,
						last_name : data.last_name,
						birthdate : (data.birthdate == "0000-00-00") ? "1970-01-01" : data.birthdate,
						gender : { id : data.gender},
						phones : [],
						emails : [],
						tags : []
					}
				}

				angular.forEach(data.phones, function(value, key){
					guestData.guest.phones.push({ id : value.id , number : value.number});
				});

				angular.forEach(data.emails, function(value, key){
					guestData.guest.emails.push({ id : value.id , email : value.email});
				});

				angular.forEach(data.tags, function(value, key){
					guestData.guest.tags.push({ id : value.id , res_guest_tag_gategory_id: value.res_guest_tag_gategory_id , name : value.name });
				});

				defered.resolve(guestData);

			}).error(function(data,status,headers){
				defered.reject(data); 
			});

			return defered.promise;
		},
		showTags : function(guestTags,tagsListGuest){

			angular.forEach(guestTags, function(value, key){
				angular.forEach(tagsListGuest, function(data, key){
					
					if(data.id == value.res_guest_tag_gategory_id){
						
						tagsListGuest[key].data.push({
							id : value.id,
							name : value.name,
							res_guest_tag_category_id : data.id
						});
					}
				});
				
			});
			return tagsListGuest;	
		},
		getTags : function(){
			var defered = $q.defer(); 
			var tagsList = [];
			var tagsListAdd = [];

			GuestDataFactory.getAllTags().success(function(data){
				tagsList = data.data;

				angular.forEach(tagsList, function(value, key){
					tagsListAdd.push({
						id : value.id,	
						data : []
					});
				});

				var response = {
					tagsList : tagsList,
					tagsListAdd : tagsListAdd
				}

				defered.resolve(response);

			}).error(function(data,status,headers){
				defered.reject(data);
			});

			return defered.promise;
		},
		parserContactData : function(value){
			var contact = "";

			if (value.phones.length == 0 && value.emails.length == 0) {
				contact = "sin telefono / correo";
			}else{

				if(value.phones.length > 0){
					contact = value.phones[0].number;
				}

				if(value.emails.length > 0){
					contact = value.emails[0].email;
				}
			}
			return contact;
		},
		reservationsList : function(idGuest,options){
			var defered = $q.defer(); 

			GuestDataFactory.getReservations(idGuest,options).success(function(data){
				var reservData = {
					pagination : {
						last_page : data.last_page,
						next_page_url : data.next_page_url,
						per_page : data.per_page,
						total : data.total
					},
					data : []
				};

				angular.forEach(data.data, function(value, key){
					value.date_reservation_text = convertTextToDate("es-ES", {weekday: "long", month: "short",day: "numeric"},value.date_reservation);
					value.hours_reservation_text = defineTimeSytem(value.hours_reservation);

					reservData.data.push(value);
				});

				defered.resolve(reservData);
			}).error(function(data,status,headers){
				defered.reject(data);
			});

			return defered.promise;
		},
		getResumenReservation : function(idGuest){
			var defered = $q.defer(); 

			GuestDataFactory.getReservations(idGuest,"").success(function(data){

				var reservData = {
					finished : 0,
					canceled : 0
				};

				angular.forEach(data.data, function(value, key){

					if(value.res_reservation_status_id == 9 || value.res_reservation_status_id == 10){
						reservData.canceled += 1; 
					}

					if(value.res_reservation_status_id == 12 ){
						reservData.finished += 1; 
					}
					
				});

				defered.resolve(reservData);
			}).error(function(data,status,headers){
				defered.reject(data);
			});

			return defered.promise;

		}
	}
})

;