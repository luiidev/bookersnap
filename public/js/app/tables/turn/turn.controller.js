angular.module('turn.controller', ['form.directive', 'localytics.directives'])
	.controller('TurnCtrl', function($scope, $stateParams, TurnFactory, MenuConfigFactory) {

		$scope.turns = {
			active: [],
			inactive: []
		};

		var init = function() {
			MenuConfigFactory.menuActive(1);

			getTurns({
				with: "zones|type_turn|calendar"
			});
		};

		var getTurns = function(options) {
			options = getAsUriParameters(options);

			TurnFactory.listTurns(options).then(
				function success(response) {
					$scope.turns.active = response.active;
					$scope.turns.inactive = response.inactive;
				},
				function error(response) {
					messageErrorApi(response.data, "Error", "warning", 0, true, response.status);
				});
		};

		$scope.deleteTurn = function(idTurn) {

			var options = {
				showCancelButton: true,
				confirmButtonText: "Si",
				cancelButtonText: "No",
			};

			message.confirmButton("Eliminar turno", "¿Estas seguro que deseas eliminar el turno ?", "info", options, function() {

				TurnFactory.deleteTurn(idTurn).then(
					function success(response) {
						messageAlert("Success", response.msg, "success", 2000, true);

						getTurns({
							with: "zones|type_turn|calendar"
						});
					},
					function error(response) {
						messageErrorApi(response.data, "Error", "warning", 0, true, response.status);
					}
				);
			});
		};

		init();
	})
	.controller('TurnCreateCtrl', function($scope, $stateParams, $state, $filter, $uibModal, TurnFactory, TypeTurnFactory,
		DateFactory, MenuConfigFactory, $timeout) {

		$scope.turnData = {
			id: '',
			name: '',
			hours_ini: '',
			hours_end: '',
			res_type_turn_id: '',
			status: 1,
			turn_zone: [],
			days: [],
			turn_time: []
		};

		$scope.dayHide = false;

		$scope.days = [];

		$scope.turnDataClone = {}; //para validar si ha ocurrido algun cambio en la data (editar)

		$scope.turnForm = {
			hours_ini: '',
			hours_end: '',
			type_turn: '',
			saveClick: false, // validamos que no se haga dbClik al guardar
			days: []
		};

		$scope.zonesTable = false; //validar si se oculta la lista de zonas (cuando estamos en mesas)

		$scope.typeTurns = {
			data: ''
		};

		$scope.turnsList = {};

		$scope.turnZoneAdd = {
			zones_id: [],
			zones_data: [],
			zonesTables: [], //van las tablas y sus reglas, zone_id , tables -> rules
			zonesDeleted: [] // las zonas eliminadas
		};

		$scope.zoneSelected = {
			id: '',
			name: '',
			rule: 1,
			tables: [],
			timesDefault: [],
			tablesId: [], //cuando marcamos check en la mesa se agrega
			chkRulesAll: {
				online: true,
				local: true,
				disabled: true
			}
		};

		$scope.mesasCheckAll = false;

		$scope.formDataDefault = {
			hours_ini: [],
			hours_end: [],
			listAvailability: []
		};

		//Cambia a true cuando abrimos por primera vez el modal,asi no ejecuta el mostrar todos siempre (solo una vez)
		$scope.validateModalZones = [];

		//tiempo de turno
		var dataTurnTime = {
			data_final: [],
			data_temporal: []
		};

		var init = function() {
			$scope.formDataDefault.listAvailability = TurnFactory.initAvailability();

			listHourIni();
			listHourEnd("create");

			loadDataTurnoEdit();
			getTypeTurns();

			if ($stateParams.turn === undefined) {
				$scope.generatedTimeTable(false, "create");
			}

			listDays();
			angular.element("#box-tables div ").addClass("fadeOut");
			MenuConfigFactory.menuActive(1);
		};

		var listDays = function() {
			$scope.days = getDaysWeek();
		};

		var checkedRulesDefault = function(rule) {
			switch (rule) {
				case 0:
					$scope.zoneSelected.chkRulesAll.online = true;
					$scope.zoneSelected.chkRulesAll.disabled = false;
					$scope.zoneSelected.chkRulesAll.local = true;
					break;
				case 1:
					$scope.zoneSelected.chkRulesAll.online = true;
					$scope.zoneSelected.chkRulesAll.disabled = true;
					$scope.zoneSelected.chkRulesAll.local = false;
					break;
				case 2:
					$scope.zoneSelected.chkRulesAll.online = false;
					$scope.zoneSelected.chkRulesAll.disabled = true;
					$scope.zoneSelected.chkRulesAll.local = true;
					break;
				case '-1':
					$scope.zoneSelected.chkRulesAll.online = true;
					$scope.zoneSelected.chkRulesAll.disabled = true;
					$scope.zoneSelected.chkRulesAll.local = true;
					break;
				default:
					$scope.zoneSelected.chkRulesAll.online = true;
					$scope.zoneSelected.chkRulesAll.disabled = true;
					$scope.zoneSelected.chkRulesAll.local = false;
					break;
			}
		};
                                
		var listHourIni = function() {
			$scope.formDataDefault.hours_ini = TurnFactory.listHour(0, 95, $scope.formDataDefault.listAvailability);
			$scope.turnForm.hours_ini = $scope.formDataDefault.hours_ini[64];
		};

		var listHourEnd = function(option) {

			var hourIniIndex = parseInt($scope.turnForm.hours_ini.index) + 1;
			$scope.formDataDefault.hours_end = TurnFactory.listHour(hourIniIndex, 120, $scope.formDataDefault.listAvailability);                        
			if (option == "create") {
				$scope.turnForm.hours_end = $scope.formDataDefault.hours_end[0];
			}
		};

		var getTypeTurns = function() {
			TypeTurnFactory.getTypeTurns().success(function(data) {

				$scope.typeTurns.data = data.data;
				$scope.turnForm.type_turn = data.data[0];

			}).error(function(data, status, headers) {
				messageErrorApi(data, "Error", "warning");
			});
		};

		var saveTurn = function(option) {

			$scope.turnData = TurnFactory.constructStructureSave($scope.turnData, $scope.turnForm, $scope.turnZoneAdd);
			$scope.turnData.turn_time = dataTurnTime.data_final;
//			console.log("saveTurn " + angular.toJson($scope.turnData, true));

			TurnFactory.saveTurn($scope.turnData, option).then(
				function success(response) {
					messageAlert("Success", "Turno registrado", "success");
					$state.reload();
				},
				function error(response) {
					$scope.turnForm.saveClick = false;
					messageErrorApi(response, "Error", "warning");
				}
			);
		};

		var loadDataTurnoEdit = function() {
			if ($stateParams.turn !== undefined) {

				var params = "with=turn_zone.zone|turn_zone.rule|turn_zone.zone.tables|turn_zone.zone.turns|turn_time";

				TurnFactory.getTurn($stateParams.turn, params, $scope.formDataDefault.listAvailability).then(
					function success(data) {
						$scope.turnData = data.turnData;
						$scope.turnForm = data.turnForm;
						$scope.turnDataClone = data.turnDataClone;

						$scope.turnZoneAdd.zones_id = data.zonesId;
						$scope.turnZoneAdd.zones_data = data.dataZones;

						$scope.generatedTimeTable(true, "edit");

						if ($scope.turnData.days.length <= 0) {
							$scope.dayHide = true;
						}
					},
					function error(data) {
						messageErrorApi(data, "Error", "warning");
					}
				);
			}
		};

		$scope.activeDay = function() {
			if ($scope.dayHide === true) {
				$scope.dayHide = false;
			} else {
				$scope.dayHide = true;
			}
		};

		$scope.checkDay = function(dayId) {
			TurnFactory.checkDay($scope.turnData.days, dayId);
		};

		$scope.generatedTimeTable = function(hourEnd, option) {

			if (hourEnd === true) {
				listHourEnd(option);
			}

			$scope.turnData.hours_ini = $scope.turnForm.hours_ini.time;
			$scope.turnData.hours_end = $scope.turnForm.hours_end.time;

			$scope.zoneSelected.timesDefault = TurnFactory.listHour($scope.turnForm.hours_ini.index, $scope.turnForm.hours_end.index, $scope.formDataDefault.listAvailability);
		};

		$scope.validateSaveTurn = function(option, frmTurn) {

			$scope.turnForm.saveClick = true;

			if (frmTurn.$valid) {
				TurnFactory.validateTurn($scope.turnData, $scope.turnForm, $scope.turnDataClone).then(
					function success(response) {

						$scope.turnForm.saveClick = false;

						if (response === true) {
							messageAlert("Mensaje del sistema", "Ya existe este horario", "info");
						}

						if ($scope.turnZoneAdd.zones_id.length === 0) {
							messageAlert("Mensaje del sistema", "Necesitas asignar minimo una zona", "info");
						}

						if (response === false && $scope.turnZoneAdd.zones_id.length > 0) {
							saveTurn(option);
						}
					},
					function error(response) {
						$scope.turnForm.saveClick = false;
						messageErrorApi(response, "Error", "warning");
					}
				);
			} else {
				messageAlert("Mensaje del sistema", "Faltan datos", "info");
				$scope.turnForm.saveClick = false;
			}
		};

		$scope.showZones = function(option) {
			$uibModal.open({
				animation: true,
				templateUrl: 'myModalZones.html',
				size: 'lg',
				controller: 'ModalTurnZoneCtrl',
				resolve: {
					turnZoneAdd: function() {
						return $scope.turnZoneAdd;
					},
					optionForm: function() {
						return option;
					},
					validateModalZones: function() {
						return $scope.validateModalZones;
					}
				}
			});
		};

		$scope.returnBoxZones = function() {

			$scope.zonesTable = false;

			TurnFactory.addRulesTable($scope.zoneSelected, $scope.turnZoneAdd);

			$scope.zoneSelected.tablesId.length = 0;
			$scope.zoneSelected.rule = 1;
		};

		$scope.deleteZone = function(zone, option) {
			var jsonZone = angular.toJson(zone);
			var zoneRule = (option == "edit" && jsonZone.indexOf("rule") != -1) ? zone.rule.id : "";

			TurnFactory.deleteZone($scope.turnZoneAdd, zone.id, zoneRule, option);
		};

		$scope.showTables = function(zone, option) {
			$scope.zonesTable = true;

			$scope.zoneSelected.id = zone.id;
			$scope.zoneSelected.name = zone.name;

			angular.element("#box-zones .table").addClass("fadeOut");

			$timeout(function() {
				angular.element("#box-zones").css("display", "none");
				angular.element("#box-tables").css("display", "block");
			}, 1000);

			if (option == "edit") {
				$scope.zoneSelected.rule = zone.rule.id;
			}

			TurnFactory.getTurnZoneTables(zone.id, $stateParams.turn, option, $scope.turnZoneAdd, $scope.turnForm, $scope.zoneSelected, $scope.formDataDefault.listAvailability).then(
				function success(response) {

					$scope.zoneSelected.tables = response;

					var tableRuleId = TurnFactory.getTurnRuleId($scope.turnZoneAdd.zonesTables, zone.id);
					var oneRule = TurnFactory.ruleExitsOne($scope.zoneSelected.tables, tableRuleId, $scope.turnForm);

					tableRuleId = (oneRule == 1) ? tableRuleId : '-1';
					checkedRulesDefault(tableRuleId);

					TurnFactory.addRulesTable($scope.zoneSelected, $scope.turnZoneAdd);

				},
				function error(response) {
					messageErrorApi(response, "Error", "warning");
				}
			);
		};

		$scope.selectedAllTables = function() {

			TurnFactory.checkAllTableZone($scope.zoneSelected.tablesId, $scope.zoneSelected.tables, $scope.mesasCheckAll);
		};

		$scope.editTableAvailability = function() {
			$uibModal.open({
				animation: true,
				templateUrl: 'myModalTableTime.html',
				size: 'lg',
				controller: 'ModalTableTimeCtrl',
				resolve: {
					timesDefault: function() {
						return $scope.zoneSelected.timesDefault;
					},
					tablesId: function() {
						return $scope.zoneSelected.tablesId;
					},
					tablesData: function() {
						return $scope.zoneSelected.tables;
					},
					turnForm: function() {
						return $scope.turnForm;
					},
					listAvailability: function() {
						return $scope.formDataDefault.listAvailability;
					},
					turnZoneAdd: function() {
						return $scope.turnZoneAdd;
					},
					zoneSelected: function() {
						return $scope.zoneSelected;
					}
				}
			});
		};

		$scope.checkTableZone = function(table) {

			TurnFactory.checkTableZone($scope.zoneSelected.tablesId, table.id);
			TurnFactory.addRulesTable($scope.zoneSelected, $scope.turnZoneAdd);
		};

		$scope.checkRuleTableAll = function(rule) {
			$scope.zoneSelected.rule = rule;
			checkedRulesDefault(rule);

			TurnFactory.checkRuleTableAll($scope.zoneSelected.tables, rule, $scope.turnForm);
			TurnFactory.addRulesTable($scope.zoneSelected, $scope.turnZoneAdd);
		};

		$scope.showTimeTurns = function() {

			$uibModal.open({
				animation: true,
				templateUrl: 'myModalTurnTime.html',
				size: 'md',
				controller: 'ModalTurnTimeCtrl',
				resolve: {
					listAvailability: function() {
						return $scope.formDataDefault.listAvailability;
					},
					dataTurnTime: function() {
						return dataTurnTime;
					}
				}
			});
		};

		init();
	})
	.controller('ModalTurnTimeCtrl', function($scope, $uibModalInstance, listAvailability, dataTurnTime) {

		$scope.turnTime = [];

		var init = function() {

			if (dataTurnTime.data_final.length > 0) {
				$scope.turnTime = dataTurnTime.data_temporal;
			} else {
				listGuest();
			}
		};

		var listGuest = function() {
			var indexHourDefault = 5;
			for (var i = 0; i <= 9; i++) {

				$scope.turnTime.push({
					text: (i === 0) ? "1 Invitado" : (i + 1) + " Invitados",
					indexHour: indexHourDefault,
					hourText: listAvailability[indexHourDefault].time_original
				});

				indexHourDefault += 1;
			}
		};

		var prepareData = function() {
			angular.forEach($scope.turnTime, function(value, key) {
				var data = {
					num_guests: key + 1,
					time: value.hourText
				};
				dataTurnTime.data_final.push(data);
			});

			dataTurnTime.data_temporal = $scope.turnTime;
		};

		$scope.defineHours = function(option, index, indexHour) {

			indexHour = (option == "next") ? indexHour + 1 : indexHour - 1;
			indexHour = (indexHour < 1) ? 1 : indexHour;

			$scope.turnTime[index].indexHour = indexHour;
			$scope.turnTime[index].hourText = listAvailability[indexHour].time_original;
		};

		$scope.defineConfigDefault = function() {

			$scope.turnTime.length = 0;
			listGuest();
		};

		$scope.saveTurnTime = function() {
			prepareData();
			$uibModalInstance.close();

		};

		$scope.closeModal = function() {
			$uibModalInstance.dismiss('cancel');
			//$scope.turnTime.length = 0;
		};

		init();


	})
	.controller('ModalTableTimeCtrl', function($scope, $uibModalInstance, timesDefault, tablesId,
		tablesData, turnForm, listAvailability, turnZoneAdd, zoneSelected, TurnFactory) {
		$scope.timesTables = [];

		$scope.rules = {};
		$scope.rules.online = [];
		$scope.rules.disabled = [];
		$scope.rules.local = [];
		$scope.rules.value = 1;
		$scope.rules.dataTemp = [];
		$scope.rulesAll = {
			online: false,
			disabled: false,
			local: false
		};

		var tableItem = [];

		var init = function() {
			listTime();
			showRulesTable();
		};

		var listTime = function() {
			$scope.timesTables = timesDefault;
		};

		var getRuleZone = function(option) {

			var zone = TurnFactory.searchZoneByZoneAdd(turnZoneAdd.zonesTables, zoneSelected.id);
			var oneRule = TurnFactory.ruleExitsOne(zoneSelected.tables, zone.res_turn_rule_id, turnForm);

			if (oneRule == 1 || option == 2) {

				switch (zone.res_turn_rule_id) {
					case 0:
						$scope.rulesAll.disabled = true;

						updateCheckRuleAll($scope.rules.local, false);
						updateCheckRuleAll($scope.rules.disabled, true);
						updateCheckRuleAll($scope.rules.online, false);

						break;
					case 1:
						$scope.rulesAll.local = true;

						updateCheckRuleAll($scope.rules.local, true);
						updateCheckRuleAll($scope.rules.disabled, false);
						updateCheckRuleAll($scope.rules.online, false);

						break;
					case 2:
						$scope.rulesAll.online = true;

						updateCheckRuleAll($scope.rules.local, false);
						updateCheckRuleAll($scope.rules.disabled, false);
						updateCheckRuleAll($scope.rules.online, true);

						break;
					default:
						$scope.rulesAll.local = true;

						updateCheckRuleAll($scope.rules.local, true);
						updateCheckRuleAll($scope.rules.disabled, false);
						updateCheckRuleAll($scope.rules.online, false);

						break;
				}

			}

			$scope.checkRuleAll(option);
		};

		var setModalRulesTables = function(table, turnForm, ruleId) {

			for (var i = turnForm.hours_ini.index; i <= turnForm.hours_end.index; i++) {

				ruleId = table[0].availability[i].rule_id;

				if (ruleId !== null) {
					ruleId = ruleId;
				}

				switch (ruleId) {
					case 0:
						$scope.rules.disabled[i] = true;
						break;
					case 1:
						$scope.rules.local[i] = true;
						break;
					case 2:
						$scope.rules.online[i] = true;
						break;
					default:
						$scope.rules.local[i] = true;
						break;
				}
			}
		};

		var showRulesTable = function() {

			var zoneRuleId = TurnFactory.getTurnRuleId(turnZoneAdd.zonesTables, zoneSelected.id);

			$scope.rules.value = zoneRuleId;

			if (tablesId.length == 1) {

				tableItem.push(TurnFactory.getTableZoneTime(tablesData, tablesId[0]));
				setModalRulesTables(tableItem, turnForm, null);

				getRuleZone(1);

			} else {

				angular.forEach(tablesId, function(value, key) {
					tableItem.push(TurnFactory.getTableZoneTime(tablesData, value));
				});

				getRuleZone(2);
			}
		};

		var updateTableRules = function(rulesTable) {
			angular.forEach(tablesData, function(value, key) {

				angular.forEach(rulesTable, function(table, key) {
					if (table.id == value.id) {
						value = table;
					}
				});
			});

			tablesData = TurnFactory.setAvailabilityText(tablesData, turnForm, listAvailability);

			//var zoneData = TurnFactory.searchZoneByZoneAdd(turnZoneAdd.zonesTables, zoneSelected.id);

			if (tablesId.length == tablesData.length) {

				angular.forEach(turnZoneAdd.zonesTables, function(zone, key) {
					if (zone.zone_id == zoneSelected.id) {
						zone.res_turn_rule_id = $scope.rules.value;
					}
				});
			}
		};

		var updateCheckRuleAll = function(rule, value) {
			var hoursIni = turnForm.hours_ini.index;
			var hoursEnd = turnForm.hours_end.index;

			for (var i = hoursIni; i <= hoursEnd; i++) {
				rule[i] = value;
			}
		};

		$scope.checkRuleAll = function(option) {

			switch (option) {
				case 1:

					updateCheckRuleAll($scope.rules.local, true);
					updateCheckRuleAll($scope.rules.disabled, false);
					updateCheckRuleAll($scope.rules.online, false);

					$scope.rules.value = 1;
					break;
				case 0:

					updateCheckRuleAll($scope.rules.local, false);
					updateCheckRuleAll($scope.rules.disabled, true);
					updateCheckRuleAll($scope.rules.online, false);

					$scope.rules.value = 0;
					break;
				case 2:

					updateCheckRuleAll($scope.rules.local, false);
					updateCheckRuleAll($scope.rules.disabled, false);
					updateCheckRuleAll($scope.rules.online, true);

					$scope.rules.value = 2;
					break;
			}

			angular.forEach($scope.timesTables, function(value, key) {
				TurnFactory.checkRuleTable(value.index, $scope.rules.value, tableItem, $scope.rules.dataTemp);
			});
		};

		$scope.checkRule = function(timeIndex, value) {
			TurnFactory.checkRuleTable(timeIndex, value, tableItem, $scope.rules.dataTemp);
		};

		$scope.saveRules = function() {
			var rulesTable = TurnFactory.saveRuleTable(tableItem, $scope.rules.dataTemp);

			updateTableRules(rulesTable);

			$uibModalInstance.close();
		};

		$scope.closeModal = function() {
			$uibModalInstance.dismiss('cancel');
		};

		init();
	})
	.controller('ModalTurnZoneCtrl', function($scope, $uibModalInstance, TurnFactory, turnZoneAdd, optionForm, validateModalZones) {

		$scope.zonesList = [];
		$scope.chkAllZones = false;

		var init = function() {
			listZones();
		};

		var listZones = function() {
			TurnFactory.listZones().then(
				function succes(response) {
					var vZones = [];

					angular.forEach(response, function(value, key) {
						value.checked = false;

						if (turnZoneAdd.zones_id.indexOf(value.id) != -1) {
							value.checked = true;
						}

						vZones.push(value);
					});

					$scope.zonesList = vZones;

					if (optionForm == "create") {
						if (validateModalZones.length === 0) {
							$scope.assignZoneAll();
							$scope.chkAllZones = true;
							validateModalZones.push(1);
						}
					}

					if ($scope.zonesList.length == turnZoneAdd.zones_id.length) {
						$scope.chkAllZones = true;
					}
				},
				function error(response) {
					messageErrorApi(response, "Error", "warning");
				}
			);
		};

		var clearTurnZones = function() {
			turnZoneAdd.zones_id.length = 0;
			turnZoneAdd.zones_data.length = 0;
		};

		$scope.assignZoneAll = function() {
//			console.log("chkAllZones " + $scope.chkAllZones);
			if ($scope.chkAllZones) {
				clearTurnZones();
			}

			angular.forEach($scope.zonesList, function(zone, key) {
				$scope.assignZone(zone);
			});
		};

		$scope.cancel = function() {
			$uibModalInstance.dismiss('cancel');
		};

		$scope.assignZone = function(zone) {
			var index = turnZoneAdd.zones_id.indexOf(zone.id);

			if (index == -1) {
				turnZoneAdd.zones_id.push(zone.id);
				turnZoneAdd.zones_data.push(zone);
				zone.checked = true;
			} else {
				turnZoneAdd.zones_id.splice(index, 1);
				turnZoneAdd.zones_data.splice(index, 1);
				zone.checked = false;
			}

			if (optionForm == "edit") {
				angular.forEach(turnZoneAdd.zonesDeleted, function(value, key) {
					if (value.res_zone_id == zone.id) {
						turnZoneAdd.zonesDeleted.splice(key, 1);
					}
				});
			}

//			console.log("zonesId " + turnZoneAdd.zones_id.length);
//			console.log("zonesData " + $scope.zonesList.length);

			if ($scope.zonesList.length != turnZoneAdd.zones_id.length) {
				$scope.chkAllZones = false;
			} else {
				$scope.chkAllZones = true;
			}
		};

		init();
	});