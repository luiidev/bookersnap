angular.module('floor.service', [])
	.factory('FloorDataFactory', function($http, HttpFactory, ApiUrlMesas, ApiUrlRoot) {
		var reservations, tables, sourceTypes;
		return {
			getBloqueos: function(reload) {
				tables = HttpFactory.get(ApiUrlMesas + "/blocks/tables", null, tables, reload);
				return tables;
			},
			getSourceTypes: function(reload) {
				sourceTypes = HttpFactory.get(ApiUrlRoot + "/reservation/source-types", null, sourceTypes, reload);
				return sourceTypes;
			},
			sendMessage: function(reservacion_id, data) {
				return $http.post(ApiUrlMesas + "/reservations/" + reservacion_id + "/send-email", data);
			}

		};
	})
	.factory('TypeFilterDataFactory', function() {
		var reservasAndBlocks = [];
		var typeColection = [];
		var sourceColection = [];
		var statusColection = [];
		var filtrosTurno = [];
		var filtrosVisita = [];
		var filtrosReserva = [];
		return {
			setReservasAndBlocks: function(data) {
				reservasAndBlocks = data;
			},
			getReservasAndBlocks: function() {
				return reservasAndBlocks;
			},
			delItemReservasAndBlocks: function(index) {
				reservasAndBlocks.splice(index, 1);
			},
			addItemReservasAndBlocks: function(item) {
				reservasAndBlocks.push(item);
			},
			setTypeTurnItems: function(typeItem) {
				var vTurn = [];
				var itemTodos = {
					id: 0,
					name: "Todos",
					status: 1,
					checked: true,
					turn: [{
						hours_ini: "00:00:00",
						hours_end: "00:00:00"
					}]
				};
				angular.forEach(typeItem, function(value) {
					vTurn.push({
						id: value.id,
						name: value.name,
						status: value.status,
						checked: false,
						turn: value.turn
					});
				});
				vTurn.unshift(itemTodos);
				typeColection = vTurn;
			},
			getTypeTurnItems: function(FloorFactory) {
				return typeColection;
			},
			setSourceTypesItems: function(sourceItem) {
				var vSource = [];
				var itemTodos = {
					id: 0,
					name: "Todos",
					status: 1,
					checked: true,
					turn: [{
						hours_ini: "00:00:00",
						hours_end: "00:00:00"
					}]
				};
				angular.forEach(sourceItem, function(value) {
					vSource.push({
						id: value.id,
						name: value.name,
						description: value.description,
						checked: false
					});
				});
				vSource.unshift(itemTodos);
				sourceColection = vSource;
			},
			getSourceTypesItems: function() {
				return sourceColection;
			},
			setStatusTypesItems: function(statusItem) {
				statusColection = statusItem;
			},
			getStatusTypesItems: function() {
				return statusColection;
			},
			setOpcionesFilterTurnos: function(typeItem) {
				if (typeItem.id === 0) {
					filtrosTurno.push(typeItem);
				} else {
					angular.forEach(filtrosTurno, function(value, key) {
						if (value.id === 0) {
							filtrosTurno.splice(key, 1);
						}
					});
					filtrosTurno.push(typeItem);
				}
			},
			getOpcionesFilterTurnos: function() {
				return filtrosTurno;
			},
			delOpcionesFilterTurnos: function(typeItem) {
				angular.forEach(filtrosTurno, function(value, key) {
					if (value.id == typeItem.id) {
						filtrosTurno.splice(key, 1);
					}
				});
			},
			setOpcionesFilterVisitas: function(genderItem) {
				if (genderItem.idcategoria == 1) {
					filtrosVisita.push(genderItem);
				} else {
					angular.forEach(filtrosVisita, function(value, key) {
						if (value.idcategoria == 1) {
							filtrosVisita.splice(key, 1);
						}
					});
					filtrosVisita.push(genderItem);
				}
			},
			getOpcionesFilterVisitas: function() {
				return filtrosVisita;
			},
			delOpcionesFilterVisitas: function(genderItem) {
				angular.forEach(filtrosVisita, function(value, key) {
					if (value.idcategoria == genderItem.idcategoria) {
						filtrosVisita.splice(key, 1);
					}
				});
			},
			setOpcionesFilterReservas: function(reservaItem) {
				if (reservaItem.id === 0) {
					filtrosReserva.push(reservaItem);
				} else {
					angular.forEach(filtrosReserva, function(value, key) {
						if (value.id === 0) {
							filtrosReserva.splice(key, 1);
						}
					});
					filtrosReserva.push(reservaItem);
				}
			},
			getOpcionesFilterReservas: function() {
				return filtrosReserva;
			},
			delOpcionesFilterReservas: function(reservaItem) {
				angular.forEach(filtrosReserva, function(value, key) {
					if (value.id == reservaItem.id) {
						filtrosReserva.splice(key, 1);
					}
				});
			}
		};
	})
	.factory('NoteFactoryData', function($http, HttpFactory, ApiUrlMesas) {

		return {
			create: function(data) {
				return $http.post(ApiUrlMesas + '/turns/notes', data);
			},
			getAll: function(params) {
				return $http.get(ApiUrlMesas + '/turns/notes?' + params);
			}
		};
	})
	.factory('FloorFactory', function($q, $interval, reservationService, TableFactory, FloorDataFactory, ServerFactory, CalendarService, NoteFactoryData, TypeFilterDataFactory, BlockFactory, $table) {
		var flag = {
			editServer: false
		};
		var serverColection = [];
		var zonesTotal = [];
		var navegaTabZone = 0;
		return {
			getZones: function(date, reload) {
				var defered = $q.defer();
				reservationService.getZones(date, reload)
					.then(
						function success(response) {
							response = response.data.data;
							defered.resolve(response);

						},
						function error(response) {
							response = response.data;
							defered.reject(response);
						}
					);
				return defered.promise;
			},
			getBlocks: function() {
				var defered = $q.defer();
				var self = this;
				reservationService.getBlocks(null, true)
					.then(function success(response) {
						response = response.data.data;
						/*angular.forEach(response, function(block) {
							self.addEventBlocks(block);
						});*/
						defered.resolve(response);
						//blocks = response.data.data;
						//console.log("loadBlock " + angular.toJson(blocks, true));
					}, function error(response) {
						response = response.data;
						defered.reject(response);
					});
				//$table.setBorderColorForReservation(vm.zones, blocks);
				return defered.promise;
			},
			addEventBlocks: function(table) {

				angular.forEach(table.blocks, function(block) {
					var event = {};
					event.fire = function() {
						var time = moment();
						try {

							var blockStartTime = moment(block.start_time, "HH:mm:ss");
							var blockEndTime = moment(block.end_time, "HH:mm:ss");

							if (time.isBetween(blockStartTime, blockEndTime)) {
								//console.log('Se ha bloqueado', block);
								table.block = true;
							} else {
								if (time.isAfter(blockEndTime)) {
									$interval.cancel(event.eventInterval);
									table.block = false;
									if (event.eventInterval) console.log("Evento cancelado, hora actual es mayor a su fin, ID: ", block);
								}
							}

						} catch (e) {
							console.log("Event error: ", e);
						}
					};
					event.eventInterval = $interval(event.fire, 6000);

					table.events.push(event);
				});
			},
			getServers: function() {
				var deferred = $q.defer();
				reservationService.getServers()
					.then(function success(response) {
						response = response.data.data;
						deferred.resolve(response);
					}, function error(response) {
						response = response.data;
						defered.reject(response);
					});

				return deferred.promise;
			},
			asingBlockTables: function(blocks, zones) {
				var self = this;
				angular.forEach(zones, function(zone) {
					angular.forEach(zone.tables, function(table) {
						table.blocks = self.searchBlockTables(blocks, table);
						self.addEventBlocks(table);
					});
				});
				//console.log('AsigBlock', angular.toJson(zones, true));
			},
			searchBlockTables: function(blocks, table) {
				var tableBlocks = [];
				angular.forEach(blocks, function(block) {
					if (block.res_table_id == table.id) {
						tableBlocks.push({
							start_time: block.start_time,
							end_time: block.end_time,
							start_date: block.start_date
						});
					}
				});
				return tableBlocks;
			},
			parseDataBlock: function(block) {
				var blockTables = [];
				angular.forEach(block.tables, function(table) {
					blockTables.push({
						res_table_id: table.id,
						start_time: block.start_time,
						end_time: block.end_time,
						start_date: block.start_date
					});

				});
				return blockTables;
			},
			getReservations: function() {
				var defered = $q.defer();
				reservationService.getReservations().then(function(response) {
					response = response.data.data;
					var objReservation = [];
					angular.forEach(response, function(reserva) {

						objReservation.push({
							reservation_id: reserva.id,
							res_type_turn_id: reserva.res_type_turn_id,
							res_source_type_id: reserva.res_source_type_id,
							res_guest_id: reserva.res_guest_id,
							res_reservation_status_id: reserva.res_reservation_status_id,
							wait_list: reserva.wait_list,
							start_date: reserva.date_reservation,
							start_time: reserva.hours_reservation,
							end_time: plusHour(reserva.hours_reservation, reserva.hours_duration),
							num_people: reserva.num_guest,
							num_people_1: reserva.num_people_1 ? reserva.num_people_1 : 0,
							num_people_2: reserva.num_people_2 ? reserva.num_people_2 : 0,
							num_people_3: reserva.num_people_3 ? reserva.num_people_3 : 0,
							tables: reserva.tables,
							source: reserva.source,
							status: reserva.status,
							type_turn: reserva.type_turn,
							first_name: reserva.guest ? reserva.guest.first_name : "Reservacion sin nombre",
							last_name: reserva.guest ? reserva.guest.last_name : "",
						});

					});
					console.log(angular.toJson(objReservation, true));
					defered.resolve(objReservation);
				}, function error(response) {
					response = response.data;
					defered.reject(response);
				});
				return defered.promise;
			},
			setBorderColorForReservation: function(zones, blocks) {
				var hour = moment();

				angular.forEach(zones, function(zone) {
					angular.forEach(zone.tables, function(table) {
						table.server.reservation = null;
						table.class.name = null;
					});
				});

				angular.forEach(zones, function(zone) {
					angular.forEach(zone.tables, function(table) {
						angular.forEach(blocks, function(block) {
							if (table.id == block.res_table_id) {
								var start_block = moment(block.start_time, "HH:mm:ss");
								var end_block = moment(block.end_time, "HH:mm:ss");
								if (hour.isBetween(start_block, end_block, null, "()") || block.res_reservation_status_id >= 14) {
									if (block.res_server_id) {
										table.server.setReservation(block.res_server.color);
									}
									table.class.setStatusClass(block.res_reservation_status_id);

									if (block.res_reservation_id === null) {
										table.block = true;
										table.blockStatic = true;
									}
								} else {
									if (block.res_reservation_id === null) {
										table.block = false;
										table.blockStatic = false;
									}
								}
							}
						});
					});
				});
			},
			setColorTable: function(zones, servers) {
				angular.forEach(zones, function(zone) {
					angular.forEach(zone.tables, function(table) {
						angular.forEach(servers, function(server) {
							angular.forEach(server.tables, function(serverTable) {
								if (table.id == serverTable.id) {
									table.server.setDefault(server.color);
								}
							});
						});
					});
				});
			},
			getReservationTables: function(zones, blocks, reservation_id) {
				var reservationTables = "";
				angular.forEach(zones, function(zone) {
					angular.forEach(zone.tables, function(table) {
						angular.forEach(blocks, function(block) {
							if (table.id == block.res_table_id) {
								if (block.res_reservation_id == reservation_id) {
									reservationTables += table.name + ", ";
								}
							}
						});
					});
				});

				return reservationTables.substring(0, reservationTables.length - 2);
			},
			clearSelected: function(zones) {
				angular.forEach(zones, function(zone) {
					angular.forEach(zone.tables, function(table) {
						table.selected = false;
					});
				});
			},
			getZoneIndexForTable: function(zones, serverTables) {
				if (serverTables.length === 0) {
					return 0;
				}
				var index = null;
				angular.forEach(zones, function(zone, zone_index) {
					if (index === null) {
						angular.forEach(zone.tables, function(table) {
							if (index === null) {
								angular.forEach(serverTables, function(serverTable) {
									if (index === null) {
										if (table.id == serverTable.id) {
											index = zone_index;
										}
									}
								});
							}
						});
					}
				});

				return index;
			},
			tablesSelected: function(zones, serverTables) {
				if (serverTables.length === 0) {
					return;
				}
				angular.forEach(zones, function(zone) {
					angular.forEach(zone.tables, function(table) {
						angular.forEach(serverTables, function(serverTable) {
							if (table.id == serverTable.id) {
								table.selected = true;
							}
						});
					});
				});
			},
			tableFilter: function(zones, blocks, cant) {
				// Manejo estatico de tiempo de reserva por cantidad  de invitados
				//var start_time = moment().add(-moment().minutes() % 15, "minutes").second(0);

				var start_time = moment().add(-moment().minutes() % 15, "minutes").second(0).millisecond(0);

				var end_time = start_time.clone().add((60 + 15 * cant), "minutes");

				angular.forEach(blocks, function(block) {
					var start_block = moment(block.start_time, "HH:mm:ss");
					var end_block = moment(block.end_time, "HH:mm:ss");
					angular.forEach(zones, function(zone) {
						angular.forEach(zone.tables, function(table) {
							if (table.id == block.res_table_id && block.res_reservation_status_id < 14) {

								var start_block = moment(block.start_time, "HH:mm:ss");
								var end_block = moment(block.end_time, "HH:mm:ss");

								/*if ((start_time.isBetween(start_block, end_block, null, "()")) ||
									(end_time.isBetween(start_block, end_block, null, "()")) ||
									(start_time.isSameOrBefore(start_block) && end_time.isSameOrAfter(end_block))) {
								*/
								if ((start_time.isBetween(start_block, end_block, null, "()")) ||
									(end_time.isBetween(start_block, end_block, null, "()")) ||
									(start_time.isSameOrBefore(start_block) && end_time.isSameOrAfter(end_block))) {

									if (block.res_reservation_id !== null) {
										table.occupied = true;
										table.suggested = false;
									} else {
										table.block = true;
										table.suggested = false;
									}
								} else {
									if (block.res_reservation_id !== null) {
										table.occupied = false;
									} else {
										table.block = false;
									}
								}
							}
						});
					});
				});

				angular.forEach(zones, function(zone) {
					angular.forEach(zone.tables, function(table) {
						if (cant >= table.minCover && cant <= table.maxCover && !table.class.name) {
							if (!table.occupied && !table.block) {
								table.suggested = true;
							}
						}
					});
				});
			},
			tableFilterClear: function(zones) {
				angular.forEach(zones, function(zone) {
					angular.forEach(zone.tables, function(table) {
						table.occupied = false;
						if (!table.blockStatic) table.block = false;
						table.suggested = false;
					});
				});
			},
			makeTimeSeated: function(zones, blocks, reservations) {
				angular.forEach(zones, function(zone) {
					angular.forEach(zone.tables, function(table) {
						table.timeSeated = null;
					});
				});
				angular.forEach(reservations, function(reservation) {
					angular.forEach(blocks, function(block) {
						if (reservation.id == block.res_reservation_id) {
							angular.forEach(zones, function(zone) {
								angular.forEach(zone.tables, function(table) {
									if (table.id == block.res_table_id) {
										console.log(table.id, block.res_table_id);
										if (reservation.datetime_input && reservation.datetime_output) {
											console.log("1");
										} else if (reservation.datetime_input) {
											var now = moment();
											var input = moment(reservation.datetime_input);
											table.timeSeated = moment.utc(now.diff(input)).format("HH:mm");
											console.log("2");
										}
									}
								});
							});
						}
					});
				});
			},
			isEditServer: function(value) {
				if (value || value === false) {
					flag.editServer = value;
				}
				return flag.editServer;
			},
			setNavegationTabZone: function(value) {
				navegaTabZone = value;
			},
			getNavegationTabZone: function() {
				return navegaTabZone;
			},
			setDataZonesTables: function(zones) {
				zonesTotal = zones;
			},
			getDataZonesTables: function() {
				return zonesTotal;
			},
			listTableServes: function() {
				var defered = $q.defer();
				ServerFactory.getAllTablesFromServer().success(function(data) {
					var vTables = [];
					angular.forEach(data.data, function(server) {
						var tables = server.tables;
						angular.forEach(tables, function(table) {
							var dataTable = {
								server_id: server.id,
								color: server.color,
								table_id: table.id
							};
							vTables.push(dataTable);
						});
					});

					defered.resolve(vTables);
				}).error(function(data, status, headers) {
					defered.reject(data);
				});
				return defered.promise;
			},
			/********************/
			listBloqueos: function() {
				var defered = $q.defer();
				var vReservation = [];
				FloorDataFactory.getBloqueos().success(function(data) {
					// console.log("***", data.data);
					angular.forEach(data.data, function(reserva) {

						var dataReservation = {
							table_id: reserva.res_table_id,
							//table_name: reserva.res_table_name,
							block_id: reserva.res_block_id,
							reservation_id: reserva.res_reservation_id,
							num_people: reserva.num_guest,
							res_reservation_status_id: reserva.res_reservation_status_id,
							start_date: reserva.start_date,
							start_time: reserva.start_time,
							end_time: reserva.end_time,
							first_name: reserva.first_name,
							last_name: reserva.last_name
						};
						vReservation.push(dataReservation);
					});

					defered.resolve(vReservation);
				}).error(function(data, status, headers) {
					defered.reject(data);
				});
				return defered.promise;
			},
			listReservas: function(reload) {
				var defered = $q.defer();
				var vReservation = [];
				reservationService.getReservations(reload).then(function(data) {
					// console.log("****", data.data.data);

					angular.forEach(data.data.data, function(reserva) {

						var obj = {
							reservation_id: reserva.id,
							res_reservation_status_id: reserva.res_reservation_status_id,
							res_server_id: reserva.res_server_id,
							note: reserva.note,
							num_people: reserva.num_guest,
							num_people_1: reserva.num_people_1 ? reserva.num_people_1 : 0,
							num_people_2: reserva.num_people_2 ? reserva.num_people_2 : 0,
							num_people_3: reserva.num_people_3 ? reserva.num_people_3 : 0,
							res_source_type_id: reserva.res_source_type_id,
							res_type_turn_id: reserva.res_type_turn_id,
							datetime_input: reserva.datetime_input,
							datetime_output: reserva.datetime_output,
							email: reserva.email,
							first_name: reserva.guest ? reserva.guest.first_name : "Reservacion sin nombre",
							last_name: reserva.guest ? reserva.guest.last_name : "",
							wait_list: reserva.wait_list

						};
						//console.log(obj);
						vReservation.push(obj);
					});
					//console.log('blbl', vReservation);
					defered.resolve(vReservation);
				}, function(data, status, headers) {
					defered.reject(data);
				});
				return defered.promise;
			},
			//Funcion para unir reservas y reservas-bloqueados
			mergeReservasBloqueo: function(reservations, tableBlocks) {
				var vReserva = [];
				var me = this;
				// console.log("**", reservations);
				angular.forEach(reservations, function(reserva) {

					var idreservacion = reserva.reservation_id;
					var vTables = [];

					angular.forEach(tableBlocks, function(block, key) {

						if (block.reservation_id == idreservacion) {
							var nextDay = getHourNextDay(block.start_time, block.start_time);
							// reserva.num_people = block.num_people;
							reserva.start_date = block.start_date;
							reserva.start_time = block.start_time;
							reserva.end_time = block.end_time;
							reserva.index_start_time = getIndexHour(block.start_time, nextDay);
							vTables.push(me.buscarTableReservation(block.table_id));

						}

					});
					reserva.tables = vTables;
					vReserva.push(reserva);
				});
				//console.log(vReserva);
				return vReserva;
			},
			buscarTableReservation: function(idTable) {
				var fecha_actual = getFechaActual();
				var defered = $q.defer();
				var me = this;
				var table_detail = {};
				var zonas = me.getDataZonesTables();

				angular.forEach(zonas, function(zone, key_zone) {
					var row_tables = zone.tables;
					var indice = key_zone + 1;

					angular.forEach(row_tables, function(table) {
						if (table.id == idTable) {
							table_detail = {
								zone_indice: indice,
								zone_id: zone.id,
								name_zona: zone.name,
								id: table.id,
								name: table.name,
							};
						}
					});

				});
				//console.log(table_detail);
				return table_detail;
			},
			//Datos para el tab de reservaciones
			listBloqueosReservas: function(reload) {
				var me = this;
				var defered = $q.defer();
				me.listReservas(reload).then(function success(reservations) {

					me.listBloqueos().then(function success(tableBlocks) {

						//console.log(angular.toJson(lstreserva, true));

						//me.listOnlyBloqueos().then(function success(blocks) {
						var lstreserva = me.mergeReservasBloqueo(reservations, tableBlocks);

						//console.log(lstreserva);
						//var union = lstreserva.concat(blocks);
						//console.log(angular.toJson(union, true));
						defered.resolve(lstreserva);
						//}, function error(response) {
						//defered.reject(response.data);
						//});

					}, function error(response) {
						defered.reject(response.data);
					});

				}, function error(response) {
					defered.reject(response.data);
				});

				return defered.promise;
			},
			listadoReservaciones: function() {
				var me = this;
				var defered = $q.defer();
				me.listBloqueosReservas().then(
					function success(data) {
						//TypeFilterDataFactory.setReservasAndBlocks(data);
						defered.resolve(data);
					},
					function error(response) {
						defered.reject(response.data);
					});
				return defered.promise;
			},
			listOnlyBloqueos: function() {
				var me = this;
				var defered = $q.defer();
				BlockFactory.getBlocks().success(function(data) {
					var vTables = [];
					var vBloqueos = [];
					angular.forEach(data.data, function(block) {
						var tables = block.tables;
						var nextDay = getHourNextDay(block.start_time, block.start_time);

						block.num_people = 0;
						block.num_people_1 = 0;
						block.num_people_2 = 0;
						block.num_people_3 = 0;
						block.res_source_type_id = null;
						block.res_type_turn_id = null;
						block.block_id = block.id;
						block.index_start_time = getIndexHour(block.start_time, nextDay);

						angular.forEach(tables, function(table, key) {
							vTables.push(me.buscarTableReservation(table.id));
							block.tables = vTables;
						});
						vBloqueos.push(block);
					});
					//console.log(vBloqueos);
					defered.resolve(vBloqueos);
				}).error(function(data, status, headers) {
					defered.reject(data);
				});
				return defered.promise;
			},
			rowTableReservation: function(idTable) {
				var me = this;
				var defered = $q.defer();
				me.listBloqueosReservas().then(function success(reservations) {
					var vTables = [];

					angular.forEach(reservations, function(reservation) {
						var tables = reservation.tables;
						// console.log(reservation);
						angular.forEach(tables, function(table) {
							if (table.id === idTable) {
								// console.log("*", reservation);
								// var obj = {
								// 	start_time: reservation.start_time,
								// 	end_time: reservation.end_time,
								// 	num_people: reservation.num_people,
								// 	reservation_id: reservation.reservation_id,
								// 	res_reservation_status_id: reservation.res_reservation_status_id
								// };
								vTables.push(reservation);
								// console.log(angular.toJson(obj, true));
							}
						});
					});
					//console.log(angular.toJson(vTables, true));
					//vTables.push(vTable);
					defered.resolve(vTables);
					//return vTables;
				}, function error(data) {
					return data;
				});
				return defered.promise;
			},
			/********************/
			//Todas las zonas con sus mesas y mas informacion //No se esta utilizando --verificar
			listZonesReservas: function() {
				var me = this;
				var defered = $q.defer();
				var fecha_actual = getFechaActual();
				reservationService.getZones(fecha_actual).success(function(data) {
					console.log("zonas");
					console.log(data.data);
					return data;
				}).error(function(data) {
					defered.reject(data);
				}).then(function(zonesData) {
					me.listBloqueos().then(function success(response) {
						console.log("blocks");
						console.log(response);
						return response;
					}, function error(response) {
						return response;
					}).then(function success(blocks) {

						me.listTableServes().then(function success(server) {
							console.log("servers");
							console.log(server);
							return server;
						}, function error(server) {
							return server;
						}).then(function success(servers) {

							var vZones = [];
							angular.forEach(zonesData.data.data, function(zone) {
								console.log("------------------------------------------");
								var tables = zone.tables;
								var vTables = [];
								angular.forEach(tables, function(table) {
									var position = table.config_position.split(",");
									var dataTable = {
										zone_id: zone.id,
										name_zona: zone.name,
										table_id: table.id,
										name: table.name,
										minCover: table.min_cover,
										maxCover: table.max_cover,
										left: position[0],
										top: position[1],
										shape: TableFactory.getLabelShape(table.config_forme),
										size: TableFactory.getLabelSize(table.config_size),
										rotate: table.config_rotation,
										price: table.price,
									};
									angular.forEach(blocks, function(block) {
										//console.log(blocks);
										if (block.table_id === table.id) {
											console.log("block", table, block);
											dataTable.res_reservation_status_id = block.res_reservation_status_id;
											dataTable.reservation_id = block.reservation_id;
										}
									});
									angular.forEach(servers, function(server) {
										//console.log(blocks);
										if (server.table_id === table.id) {
											console.log("server", table, server);
											dataTable.server_id = server.server_id;
											dataTable.color = server.color;
										}
									});
									vTables.push(dataTable);
								});
								var dataZone = {
									zone_id: zone.id,
									name: zone.name,
									table: vTables,
								};
								vZones.push(dataZone);
							});

							defered.resolve(vZones);

						}, function error(server) {
							defered.reject(server);
						});

					}, function error(response) {
						defered.reject(response);
					});

				});
				return defered.promise;
			},
			listTurnosActivos: function(date) {
				var defered = $q.defer();
				var self = this;

				CalendarService.GetShiftByDate(date).then(
					function success(response) {
						var typeTurnsData = response.data.data;
						var turns = [];

						NoteFactoryData.getAll(date).then(
							function success(response) {
								response = response.data.data;
								response = self.listNotesTypeTurn(response, typeTurnsData);

								defered.resolve(response);
							},
							function error(response) {
								defered.reject(response);
							});
					},
					function error(response) {
						defered.reject(response);
					}
				);

				return defered.promise;
			},
			listNotesTypeTurn: function(notes, turns) {
				angular.forEach(turns, function(turn, key) {
					angular.forEach(notes, function(note, key) {
						if (note.res_type_turn_id == turn.id) {
							turn.notes = note;
						}
					});
				});
				return turns;
			},
			createNotes: function(data) {
				var defered = $q.defer();

				NoteFactoryData.create(data).then(
					function success(response) {
						defered.resolve(response.data);
					},
					function error(response) {
						defered.reject(response.data);
					}
				);
				return defered.promise;
			}
		};
	})
	.factory('OperationFactory', function() {
		return {
			setNumPerson: function(numperson, tipo, value) {
				if (tipo == 'men') {
					numperson.men = value;
				}
				if (tipo == 'women') {
					numperson.women = value;
				}
				if (tipo == 'children') {
					numperson.children = value;
				}
			},
			getTotalPerson: function(numperson) {
				var total = parseInt(numperson.men) + parseInt(numperson.women) + parseInt(numperson.children);
				return total;
			}
		};
	})
	.factory('ServerDataFactory', function($q, ServerFactory) {
		var tableColection = [];
		var serverColection = [];
		var colorColection = [];
		var interfazServer = {
			getTableServerItems: function() {
				return tableColection;
			},
			setTableServerItems: function(tableItem) {
				tableColection.push({
					id: tableItem.id,
					name: tableItem.name
				});
			},
			setTableServerItemsEdit: function(tableItem) {
				tableColection = tableItem;
			},
			delTableServerItem: function(tableItem) {
				angular.forEach(tableColection, function(value, key) {
					if (value.id == tableItem.id) {
						tableColection.splice(key, 1);
					}
				});
			},
			delTableServerItemIndex: function(index) {
				tableColection.splice(index, 1);
			},
			cleanTableServerItems: function() {
				tableColection = [];
			},
			getServerItems: function() {
				return serverColection;
			},
			setServerItems: function(serverItem) {
				serverColection = serverItem;
			},
			addServerItems: function(serverItem) {
				serverColection.push(serverItem);
			},
			delServerItem: function(serverItem) {
				angular.forEach(serverColection, function(value, key) {
					if (value.id == serverItem.id) {
						serverColection.splice(key, 1);
					}
				});
			},
			updateServerItems: function(serverItem) {
				angular.forEach(serverColection, function(value, key) {
					if (value.id == serverItem.id) {
						value.name = serverItem.name;
						value.color = serverItem.color;
						value.tables = serverItem.tables;
					}
				});
			},
			getColorItems: function() {
				return colorColection;
			},
			setColorItems: function(colorItem) {
				colorColection.push(colorItem);
			},
			listadoServers: function() {
				var defered = $q.defer();
				ServerFactory.getAllTablesFromServer().success(function(data) {
					defered.resolve(data.data);
				}).error(function(data, status, headers) {
					defered.reject(data);
				});
				return defered.promise;
			}
		};
		return interfazServer;
	});