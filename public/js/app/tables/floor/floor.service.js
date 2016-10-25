angular.module('floor.service', [])
	.factory('FloorDataFactory', function($http, HttpFactory, ApiUrlMesas) {
		var reservations, tables;
		return {
			getBloqueos: function(reload) {
				tables = HttpFactory.get(ApiUrlMesas + "/blocks/tables", null, tables, reload);
				return tables;
			},
			getReservas: function(reload) {
				reservations = HttpFactory.get(ApiUrlMesas + "/reservations", null, reservations, reload);
				return reservations;
			},

		};
	})
	.factory('TypeFilterDataFactory', function() {
		var typeColection = [];
		var filtrosVisita = [];
		return {
			setTypeTurnItems: function(typeItem) {
				typeColection = typeItem;
			},
			getTypeTurnItems: function() {
				return typeColection;
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
	.factory('FloorFactory', function($q, reservationService, TableFactory, FloorDataFactory, ServerFactory, CalendarService, NoteFactoryData, TypeFilterDataFactory) {
		var flag = {
			editServer: false
		};
		var serverColection = [];
		var zonesTotal = [];
		var navegaTabZone = 0;
		return {
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
			listReservas: function() {
				var defered = $q.defer();
				var vReservation = [];
				FloorDataFactory.getReservas().then(function(data) {
					// console.log("****", data.data.data);
					angular.forEach(data.data.data, function(reserva) {
						var obj = {
							reservation_id: reserva.id,
							res_reservation_status_id: reserva.res_reservation_status_id,
							res_server_id: reserva.res_server_id,
							note: reserva.note,
							num_people: reserva.num_guest,
							num_people_1: reserva.num_people_1,
							num_people_2: reserva.num_people_2,
							num_people_3: reserva.num_people_3,
							datetime_input: reserva.datetime_input,
							datetime_output: reserva.datetime_output,
							first_name: reserva.guest ? reserva.guest.first_name : "Reservacion sin nombre",
							last_name: reserva.guest ? reserva.guest.last_name : ""
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
			mergeReservasBloqueo: function(reservations, blocks) {
				var vReserva = [];
				var me = this;
				// console.log("**", reservations);
				angular.forEach(reservations, function(reserva) {

					var idreservacion = reserva.reservation_id;
					var vTables = [];

					angular.forEach(blocks, function(block, key) {

						if (block.reservation_id == idreservacion) {
							// reserva.num_people = block.num_people;
							reserva.start_date = block.start_date;
							reserva.start_time = block.start_time;
							reserva.end_time = block.end_time;
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
			listBloqueosReservas: function() {
				var me = this;
				var defered = $q.defer();
				me.listReservas().then(function success(reservations) {

					me.listBloqueos().then(function success(blocks) {
						var lstreserva = me.mergeReservasBloqueo(reservations, blocks);
						//console.log(angular.toJson(lstreserva, true));
						defered.resolve(lstreserva);
					}, function error(response) {
						defered.reject(response.data);
					});

				}, function error(response) {
					defered.reject(response.data);
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