angular.module('floor.service', [])
	.factory('FloorDataFactory', function($http, ApiUrlMesas) {
		return {
			getReservas: function() {
				//return $http.get(ApiUrlRoot + "/admin/ms/1/mesas/reservation/getreservas");
				return $http.get(ApiUrlMesas + "/reservations");
			},
		}
	})

.factory('FloorFactory', function($q, ZoneFactory, TableFactory, FloorDataFactory) {
	return {
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
						}
						vTables.push(dataTable);
					});
					var dataZone = {
						zone_id: zones.zone_id,
						name: zones.name,
						table: vTables,
					}
					vZones.push(dataZone);
				});

				defered.resolve(vZones);
			}).error(function(data, status, headers) {
				defered.reject(data);
			});
			return defered.promise;
		},
		listReservation: function() {
			var defered = $q.defer();
			FloorDataFactory.getReservas().success(function(data) {
				var vReservation = [];
				angular.forEach(data.data, function(reserva) {
					var dataReservation = {
						table_id: reserva.res_table_id,
						block_id: reserva.res_block_id,
						reservation_id: reserva.res_reservation_id,
						num_people: reserva.num_people,
						start_time: reserva.start_time,
						end_time: reserva.end_time,
						first_name: reserva.first_name,
						last_name: reserva.last_name
					}
					vReservation.push(dataReservation);
				});

				defered.resolve(vReservation);
			}).error(function(data, status, headers) {
				defered.reject(data);
			});
			return defered.promise;
		},
		listTableReservation: function(idTable) {
			var me = this;
			var defered = $q.defer();
			me.listReservation().then(function success(reservations) {
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
			})
			return defered.promise;
		},

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
							}
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

	}

})