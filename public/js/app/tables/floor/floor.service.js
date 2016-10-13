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

.factory('FloorFactory', function($q, reservationService, TableFactory, FloorDataFactory, ServerFactory) {
		var flag = {
			editServer: false
		};
		var serverColection = [];
		return {
			isEditServer: function(value) {
				if (value || value === false) {
					flag.editServer = value;
				}
				return flag.editServer;
			},
			getServerItems: function() {
				return serverColection;
			},
			setServerItems: function(serverItem) {
				serverColection.push(serverItem);
			},
			delServerItem: function(serverItem) {
				angular.forEach(serverColection, function(value, key) {
					if (value.table_id == serverItem.table_id) {
						serverColection.splice(key, 1);
					}
				});
			},
			delServerItemIndex: function(index) {
				serverColection.splice(index, 1);
			},
			cleanServerItems: function() {
				serverColection = [];
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
				FloorDataFactory.getBloqueos().success(function(data) {
					var vReservation = [];
					angular.forEach(data.data, function(reserva) {
						var dataReservation = {
							table_id: reserva.res_table_id,
							//table_name: reserva.res_table_name,
							block_id: reserva.res_block_id,
							reservation_id: reserva.res_reservation_id,
							num_people: reserva.num_people,
							res_reservation_status_id: reserva.res_reservation_status_id,
							start_date: reserva.start_date,
							start_time: reserva.start_time,
							end_time: reserva.end_time,
							//first_name: reserva.first_name,
							//last_name: reserva.last_name
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
				FloorDataFactory.getReservas().success(function(data) {
					var vReservation = [];
					angular.forEach(data.data, function(reserva) {
						var dataReservation = {
							reservation_id: reserva.id,
							res_reservation_status_id: reserva.res_reservation_status_id,
							first_name: reserva.guest.first_name,
							last_name: reserva.guest.last_name
						};
						vReservation.push(dataReservation);
					});

					defered.resolve(vReservation);
				}).error(function(data, status, headers) {
					defered.reject(data);
				});
				return defered.promise;
			},
			listBloqueosReservas: function() {
				var me = this;
				var defered = $q.defer();
				me.listBloqueos().then(function success(data) {
					return data;
				}, function error(data) {
					return data;
				}).then(function(blocks) {
					me.listReservas().then(function success(response) {
							return response;
						},
						function error(response) {
							return response;
						}).then(function success(reservations) {
							var vReserva = [];
							angular.forEach(blocks, function(block) {
								var itemRes = block.reservation_id;
								//angular.forEach(zone.table, function(table) {
								if (itemRes) {
									angular.forEach(reservations, function(resData, key) {
										//console.log(angular.toJson(tableData, true));
										if (resData.reservation_id == itemRes) {
											//console.log(angular.toJson(key, true));
											block.res_reservation_status_id = resData.res_reservation_status_id;
											block.first_name = resData.first_name;
											block.last_name = resData.last_name;

										}
									});
								}
								vReserva.push(block);
							});

							defered.resolve(vReserva);
						},
						function error(response) {
							defered.reject(response);
						}
					);

				});

				return defered.promise;
			},
			rowTableReservation: function(idTable) {
				var me = this;
				var defered = $q.defer();
				me.listBloqueosReservas().then(function success(reservations) {
					var vTables = [];
					angular.forEach(reservations, function(reservation) {
						if (reservation.table_id === idTable) {
							vTables.push(reservation);
							//console.log(angular.toJson(reservations, true));
						}
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
			listZonesReservas: function() {
				var me = this;
				var defered = $q.defer();
				var fecha_actual = getFechaActual();
				reservationService.getZones(fecha_actual).success(function(data) {
					return data;
				}).error(function(data) {
					defered.reject(data);
				}).then(function(zonesData) {

					me.listBloqueos().then(function success(response) {
						return response;
					}, function error(response) {
						return response;
					}).then(function success(blocks) {

						me.listTableServes().then(function success(server) {
							return server;
						}, function error(server) {
							return server;
						}).then(function success(servers) {

							var vZones = [];
							angular.forEach(zonesData.data.data, function(zone) {
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
											dataTable.res_reservation_status_id = block.res_reservation_status_id;
										}
									});
									angular.forEach(servers, function(server) {
										//console.log(blocks);
										if (server.table_id === table.id) {
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
			listZonesBloqueosReservas: function() {
				var me = this;
				var defered = $q.defer();
				var fecha_actual = getFechaActual();
				reservationService.getZones(fecha_actual).success(function(data) {
					return data;
				}).error(function(data) {
					defered.reject(data);
				}).then(function(zonesData) {

					me.listBloqueosReservas().then(function success(response) {
						return response;
					}, function error(response) {
						return response;
					}).then(function success(blocks) {
							var vTables = [];
							angular.forEach(zonesData.data.data, function(zone) {
								var tables = zone.tables;

								angular.forEach(tables, function(table) {

									angular.forEach(blocks, function(block) {
										//console.log(blocks);
										if (block.table_id === table.id) {
											var dataTable = {
												zone_id: zone.id,
												name_zona: zone.name,
												table_id: table.id,
												name: table.name,
												block_id: block.block_id,
												reservation_id: block.reservation_id,
												num_people: block.num_people,
												res_reservation_status_id: block.res_reservation_status_id,
												start_date: block.start_date,
												start_time: block.start_time,
												end_time: block.end_time,
												first_name: block.first_name,
												last_name: block.last_name,
											};
											vTables.push(dataTable);
										}
									});

								});

							});

							defered.resolve(vTables);

						},
						function error(response) {
							defered.reject(response);
						}
					);

				});
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
	.factory('ServerDataFactory', function() {
		var serverColection = [];
		var interfazServer = {
			getServerItems: function() {
				return serverColection;
			},
			setServerItems: function(serverItem) {
				serverColection.push(serverItem);
			},
			delServerItem: function(serverItem) {
				angular.forEach(serverColection, function(value, key) {
					if (value.table_id == serverItem.table_id) {
						serverColection.splice(key, 1);
					}
				});
			},
			cleanServerItems: function() {
				serverColection = [];
			}
		};
		return interfazServer;
	});