angular.module('guest.controller', [])
	.controller('GuestCtrl', function(GuestFactory, $state) {

		var vm = this;

		vm.guestList = [];

		vm.init = function() {
			vm.guestAll();
		};

		vm.configScrollBar = optionsScrollBarPLugin('y', 'light', '100%');

		vm.guestAll = function() {
			GuestFactory.guestList().then(function success(response) {

				vm.guestList = response;

				vm.showGuest(vm.guestList);

			}, function error(response) {
				messageErrorApi(response.data, "Error", "warning", 0, true, response.status);
			});
		};

		vm.showGuest = function(guestData) {
			$state.go("mesas.guest.view", {
				'guest': guestData[0].id
			});
		};

		vm.init();

	})
	.controller('GuestViewCtrl', function(GuestFactory, GuestDataFactory, $stateParams) {
		var vm = this;
		var dateNow = convertFechaYYMMDD(new Date(), "es-ES", {});

		vm.guestId = $stateParams.guest;

		vm.guestData = {
			name: '',
			contact: '',
			reservations: {
				resumen: {},
				past: [],
				last: []
			}
		};

		vm.paginationReservation = {
			totalItems: 0,
			currentPage: 1,
			maxSize: 10,
			itemsPage: 1
		};

		vm.init = function() {
			vm.getGuest();

			vm.getReservations({
				page: vm.paginationReservation.currentPage,
				page_size: vm.paginationReservation.itemsPage,
				end_date: dateNow
			}, "past");

			vm.getReservations({
				start_date: dateNow
			}, "last");

			vm.getResumenReservation();
		};

		vm.getGuest = function() {
			if ($stateParams.guest !== undefined) {

				GuestDataFactory.getGuest($stateParams.guest).then(function success(response) {
					var data = response.data.data;
					vm.guestData.name = data.first_name + " " + data.last_name;
					vm.guestData.contact = GuestFactory.parserContactData(data);

				}, function error(response) {
					messageErrorApi(response.data, "Error", "warning", 0, true, response.status);
				});
			}
		};

		vm.getReservations = function(options, type) {

			options = getAsUriParameters(options);

			angular.element("#item-reserva").addClass("hide");

			GuestFactory.reservationsList(vm.guestId, options).then(function success(response) {

				if (type == "last") {
					vm.guestData.reservations.last = response.data;
				} else {
					vm.guestData.reservations.past = response.data;
					vm.paginationReservation.totalItems = response.pagination.total;
				}
				setTimeout(function() {
					angular.element("#item-reserva").removeClass("hide");
				}, 500);

			}, function error(response) {
				messageErrorApi(response.data, "Error", "warning", 0, true, response.status);
			});
		};

		vm.pageReservationChanged = function(page) {
			vm.getReservations({
				page: page,
				page_size: vm.paginationReservation.itemsPage,
				end_date: dateNow
			}, "past");
		};

		vm.getResumenReservation = function() {
			GuestFactory.getResumenReservation(vm.guestId).then(function success(response) {
				console.log(angular.toJson(response, true));
				vm.guestData.reservations.resumen = response;
			}, function error(response) {
				messageErrorApi(response.data, "Error", "warning", 0, true, response.status);
			});
		};

		vm.init();
	})
	.controller('GuestCreateCtrl', function(GuestFactory, GuestDataFactory, $compile, $scope, $state, $stateParams) {
		var vm = this;

		vm.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
		vm.format = vm.formats[1];

		vm.contentTab = {
			active: "datos.html",
			tab1: 'active',
			tab2: ''
		};

		vm.guestData = {
			first_name: '',
			last_name: '',
			birthdate: '',
			gender: '',
			phones: [],
			emails: [],
			tags: [],
			custom_tags: []
		};

		vm.guestFormData = {
			gender: '',
			birthdate: ''
		};

		vm.tagsList = [];
		vm.tagsListAdd = [];

		vm.phone = "";
		vm.email = "";

		vm.genderData = null;

		vm.init = function() {
			vm.listGender();

			GuestFactory.getTags().then(
				function success(response) {
					vm.tagsList = response.tagsList;
					vm.tagsListAdd = response.tagsListAdd;

					vm.listAllTagsCustom();
					vm.loadDataGuestEdit();
				},
				function error(response) {
					console.log("getTags error ", angular.toJson(response, true));
				});
		};

		vm.listAllTagsCustom = function() {
			GuestFactory.getTagsCustomGuest().then(
				function success(response) {
					response = response.data;
					angular.forEach(vm.tagsList, function(tag, key) {
						if (tag.id == 4) {
							tag.tags = response;
						}
					});
				},
				function error(response) {
					console.error("listAllTagsCustom " + angular.toJson(response, true));
				});
		};

		vm.listGender = function() {
			vm.genderData = getGender();
			vm.guestFormData.gender = vm.genderData[0];
		};

		vm.selectTab = function(tabItem) {
			vm.contentTab = GuestFactory.getTabSelected(tabItem);
		};

		vm.validaSaveGuest = function(frmGuest) {
			if (frmGuest.$valid) {
				vm.saveGuest();
			}
		};

		vm.saveGuest = function() {
			vm.prepareCustomTagSave();
			console.log("saveGuest " + angular.toJson(vm.guestData, true));

			vm.guestData.birthdate = convertFechaYYMMDD(vm.guestFormData.birthdate, "es-ES", {});
			vm.guestData.gender = vm.guestFormData.gender.id;

			var option = ($stateParams.guest !== undefined) ? "edit" : "create";

			GuestFactory.saveGuest(vm.guestData, option).then(function success(response) {
				$state.reload();
				messageAlert("Success", "Huesped registrado", "success", 0, true);
			}, function error(response) {
				messageErrorApi(response.data, "Error", "warning", 0, true, response.status);
			});
		};

		vm.insertPhone = function() {
			vm.guestData.phones = GuestFactory.insertDataContact(vm.guestData.phones, vm.phone, 'telefono');
			vm.phone = "";
		};

		vm.deletePhone = function(index) {
			vm.guestData.phones.splice(index, 1);
		};

		vm.insertEmail = function() {
			vm.guestData.emails = GuestFactory.insertDataContact(vm.guestData.emails, vm.email, 'email');
			vm.email = "";
		};

		vm.deleteEmail = function(index) {
			vm.guestData.emails.splice(index, 1);
		};

		vm.openCalendar = function($event, opened) {
			$event.preventDefault();
			$event.stopPropagation();
			vm.opened = true;
		};

		vm.prepareCustomTagSave = function() {
			vm.guestData.custom_tags = vm.tagsListAdd[3].data;

			angular.forEach(vm.guestData.tags, function(tag, key) {
				var json = angular.toJson(tag);

				if (json.indexOf("custom_tag") > -1) {

					if (tag.custom_tag === true) {
						vm.guestData.tags.splice(key);
					}
				}
			});
		};

		vm.addTag = function(tag, category) {

			var index = GuestFactory.existsTag(vm.tagsListAdd[category].data, tag.id);

			var tagsData = {
				id: tag.id,
				name: tag.name,
				res_guest_tag_category_id: tag.res_guest_tag_gategory_id
			};

			if (index === null) {
				vm.tagsListAdd[category].data.push(tagsData);
				vm.guestData.tags.push({
					id: tagsData.id,
					custom_tag: (category === 3) ? true : false
				});
			} else {
				vm.tagsListAdd[category].data.splice(index, 1);
				var indexTag = GuestFactory.existsTag(vm.guestData.tags, tag.id);
				vm.guestData.tags.splice(indexTag, 1);
			}
		};

		vm.loadDataGuestEdit = function() {
			if ($stateParams.guest !== undefined) {

				GuestFactory.getGuest($stateParams.guest).then(function success(response) {
					vm.guestData = response.guest;

					vm.guestFormData.birthdate = convertFechaToDate(vm.guestData.birthdate);
					vm.guestFormData.gender = vm.guestData.gender;

					GuestFactory.showTags(response.guest.tags, vm.tagsListAdd);

					GuestFactory.showTags(response.guest.custom_tags, vm.tagsListAdd);

					console.log("loadDataGuestEdit " + angular.toJson(vm.tagsListAdd, true));

				}, function error(response) {
					messageErrorApi(response.data, "Error", "warning", 0, true, response.status);
				});
			}
		};

		vm.init();
	});