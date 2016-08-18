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
.controller('GuestCreateCtrl', function(GuestFactory,GuestDataFactory,$compile,$scope) {
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
		birthday : '',
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
		vm.listTags();
	};

	vm.listGender = function(){
		vm.genderData = getGender();
		vm.guestData.gender = vm.genderData[0];
	};

	vm.selectTab = function(tabItem){
		vm.contentTab = GuestFactory.getTabSelected(tabItem);	
	};

	vm.saveGuest = function(){
		console.log("saveGuest " + angular.toJson(vm.guestData, true));
	};

	vm.insertPhone = function(){
		vm.guestData.phones = GuestFactory.insertDataContact(vm.guestData.phones,vm.phone,'telefono');;
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

	vm.listTags = function(){

		GuestDataFactory.getAllTags().success(function(data){
			vm.tagsList = data.data;

			angular.forEach(vm.tagsList, function(value, key){
				vm.tagsListAdd.push({
					index : key,
					data : []
				});
			});

			console.log("listTags " , angular.toJson(vm.tagsListAdd,true));
		});
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
			vm.guestData.tags.push(tagsData);
		}else{
			vm.tagsListAdd[category].data.splice(index, 1);
			/*var indexTag = GuestFactory.existsTag(vm.guestData.tags,tag.id);
			vm.vm.guestData.tags.splice(indexTag, 1);*/
		}

		console.log("addTags " + angular.toJson(vm.tagsListAdd[category].data,true));
	};

	vm.init();


})
;