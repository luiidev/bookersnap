angular.module('floor.service', [])
	.factory('FloorDataFactory', function($http, ApiUrlMesas) {
		return {
			getBloqueos: function() {
				//return $http.get(ApiUrlRoot + "/admin/ms/1/mesas/reservation/getreservas");
				return $http.get(ApiUrlMesas + "/blocks/tables");
			},
			getReservas: function() {
				return $http.get(ApiUrlMesas + "/reservations");
			},

		};
	})

.factory('FloorFactory', function($q, ZoneFactory, TableFactory, FloorDataFactory) {
	return {
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
		/*
				listZones: function() {
					var defered = $q.defer();
					ZoneFactory.getZones().success(function(data) {

						var vZones = [];
						angular.forEach(data.data, function(zones) {
							var tables = zones.tables;
							var vTables = [];
							angular.forEach(tables, function(table) {
								var position = table.config_position.split(",");
								var dataTable = {
									zone_id: zones.id,
									name_zona: zones.name,
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
								vTables.push(dataTable);
							});
							var dataZone = {
								zone_id: zones.zone_id,
								name: zones.name,
								table: vTables,
							};
							vZones.push(dataZone);
						});

						defered.resolve(vZones);
					}).error(function(data, status, headers) {
						defered.reject(data);
					});
					return defered.promise;
				},*/
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
			ZoneFactory.getZones().success(function(data) {
				return data;
			}).error(function(data) {
				defered.reject(data);
			}).then(function(zonesData) {

				me.listBloqueos().then(function success(response) {
					return response;
				}, function error(response) {
					return response;
				}).then(function success(blocks) {

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
									console.log(blocks);
									if (block.table_id === table.id) {
										dataTable.res_reservation_status_id = block.res_reservation_status_id;
									}
								});
								vTables.push(dataTable);
							});
							var dataZone = {
								zone_id: zone.zone_id,
								name: zone.name,
								table: vTables,
							};
							vZones.push(dataZone);
						});

						defered.resolve(vZones);

					},
					function error(response) {
						defered.reject(response);
					}
				);

			});
			return defered.promise;
		},
		/*
				listZonesReservation: function() {
					var me = this;
					var defered = $q.defer();
					me.listZones().then(function success(data) {
						return data;
					}, function error(data) {
						return data;
					}).then(function(zones) {
						me.listReservation().then(function success(tables) {
								return tables;
							},
							function error(response) {
								return response;
							}).then(function success(tablesRes) {
								var vZonas = [];

								angular.forEach(zones, function(zone) {
									var vTable = {
										zone_id: zone.zone_id,
										name: zone.name,
										table: []
									};
									angular.forEach(zone.table, function(table) {

										if (tablesRes) {
											angular.forEach(tablesRes, function(tableData, key) {
												//console.log(angular.toJson(tableData, true));
												if (tableData.table_id == table.table_id) {
													//console.log(angular.toJson(key, true));
													table.block_id = tableData.block_id;
													table.reservation_id = tableData.reservation_id;
													table.num_people = tableData.num_people;
													table.start_time = tableData.start_time;
													table.end_time = tableData.end_time;
												}
											});
										}
										vTable.table.push(table);
									});
									vZonas.push(vTable);
								});

								defered.resolve(vZonas);
							},
							function error(response) {
								defered.reject(response);
							}
						);

					});

					return defered.promise;
				}
		*/
	};

});