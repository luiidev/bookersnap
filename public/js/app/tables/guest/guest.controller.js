angular.module('guest.controller', [])
.controller('GuestCtrl', function(GuestFactory) {

	var vm = this;

	vm.guestList = [];

	var init = function(){
		guestAll();
	};

	var guestAll = function(){
		GuestFactory.guestList().then(function success(response){
			vm.guestList = response;
		},function error(response){
			messageErrorApi(response,"Error","warning");
		});
	};

	init();

})
.controller('GuestViewCtrl', function(GuestFactory,$stateParams) {
	var vm = this;

	vm.guestId = $stateParams.guest;
})
.controller('GuestCreateCtrl', function(GuestFactory,GuestDataFactory,$compile,$scope,$state,$stateParams) {
	var vm = this;

	vm.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];

	vm.contentTab = {
		active : "datos.html",
		tab1 : 'active',
		tab2 : ''
	};

	vm.guestData = {
		first_name : '',
		last_name : '',
		birthdate : '',
		gender : '',
		phones : [],
		emails : [],
		tags : []
	};

	vm.tagsList = [];
	vm.tagsListAdd = [];

	vm.phone = "";
	vm.email = "";

	vm.genderData = null;

	vm.init = function(){
		vm.listGender();
		
		GuestFactory.getTags().then(function success(response){
			vm.tagsList = response.tagsList;
			vm.tagsListAdd = response.tagsListAdd;
			vm.loadDataGuestEdit();
		},function error(response){
			console.log("getTags error " , angular.toJson(response, true));
		});	
	};

	vm.listGender = function(){
		vm.genderData = getGender();
		vm.guestData.gender = vm.genderData[0];
	};

	vm.selectTab = function(tabItem){
		vm.contentTab = GuestFactory.getTabSelected(tabItem);	
	};

	vm.validaSaveGuest = function(frmGuest){
		if (frmGuest.$valid) {
			vm.saveGuest();
		}
	};

	vm.saveGuest = function(){

		console.log("saveGuest " + angular.toJson(vm.guestData,true));

		vm.guestData.birthdate = convertFechaYYMMDD(vm.guestData.birthdate,"es-ES", {});
		vm.guestData.gender = vm.guestData.gender.id;

		var option = ($stateParams.guest != undefined) ? "edit" : "create";
	
		GuestFactory.saveGuest(vm.guestData,option).then(function success(response){
			$state.reload();
			messageAlert("Success","Huesped registrado","success");
		},function error(response){
			messageErrorApi(response,"Error","warning");
		});
	};

	vm.insertPhone = function(){
		vm.guestData.phones = GuestFactory.insertDataContact(vm.guestData.phones,vm.phone,'telefono');
		vm.phone = "";
	};

	vm.deletePhone = function(index){
		vm.guestData.phones.splice(index, 1);
	};

	vm.insertEmail = function(){
		vm.guestData.emails = GuestFactory.insertDataContact(vm.guestData.emails,vm.email,'email');
		vm.email = "";
	};

	vm.deleteEmail = function(index){
		vm.guestData.emails.splice(index, 1);
	};

	vm.openCalendar = function($event, opened) {
		$event.preventDefault();
		$event.stopPropagation();
		vm.opened = true;
	};

	vm.addTag = function(tag,category){

		var index = GuestFactory.existsTag(vm.tagsListAdd[category].data,tag.id);

		var tagsData = {
			id : tag.id,
			name : tag.name,
			res_guest_tag_category_id : tag.res_guest_tag_gategory_id
		}

		if(index == null){
			vm.tagsListAdd[category].data.push(tagsData);
			vm.guestData.tags.push({id : tagsData.id});
		}else{
			vm.tagsListAdd[category].data.splice(index, 1);
			var indexTag = GuestFactory.existsTag(vm.guestData.tags,tag.id);
			vm.guestData.tags.splice(indexTag, 1);
		}
	};

	vm.loadDataGuestEdit = function(){
		if ($stateParams.guest != undefined) {
			
			GuestFactory.getGuest($stateParams.guest).then(function success(response){
				vm.guestData = response.guest;
				GuestFactory.showTags(response.guest.tags,vm.tagsListAdd);

			},function error(response){
				messageErrorApi(response,"Error","warning");
			});
		}
	};

	vm.init();
})
;