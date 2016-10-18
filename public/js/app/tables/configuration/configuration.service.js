angular.module('configuration.service', [])
	.service('ConfigurationDataService', function($http, ApiUrlMesas) {
		return {
			getConfiguration: function() {
				return $http.get(ApiUrlMesas + "/configuration/reservations");
			},
			updateConfiguration: function(idMicrosite, configuration) {
				return $http.put(ApiUrlMesas + "/configuration/reservations/" + idMicrosite, {}, {
					params: {
						time_tolerance: configuration.time_tolerance,
						time_restriction: configuration.time_restriction,
						max_people: configuration.max_people,
						max_table: configuration.max_table,
						res_code_status: configuration.res_code_status,
						res_privilege_status: configuration.res_privilege_status,
						messenger_status: configuration.messenger_status,
						user_add: configuration.user_add,
						user_upd: configuration.user_upd,
						reserve_portal: configuration.reserve_portal,
						res_percentage_id: configuration.res_percentage_id,
						name_people_1: configuration.name_people_1,
						name_people_2: configuration.name_people_2,
						name_people_3: configuration.name_people_3,
						status_people_1: configuration.status_people_1,
						status_people_2: configuration.status_people_2,
						status_people_3: configuration.status_people_3
					}
				});
			},
			getListPercentage: function() {
				return $http.get(ApiUrlMesas + "/configuration/percentages");
			},
			getConfigurationCode: function() {
				return $http.get(ApiUrlMesas + "/configuration/codes");
			},
			storeConfigurationCode: function(idMicrosite, code) {
				return $http.post(ApiUrlMesas + "/configuration/codes", {}, {
					params: {
						code: code,
						ms_microsite_id: idMicrosite,
					}
				});
			},
			updateConfigurationCode: function(idCod, configuration) {
				return $http.put(ApiUrlMesas + "/configuration/codes/" + idCod, {}, {
					params: {
						code: configuration.code,
						ms_microsite_id: idMicrosite,
					}
				});
			},
			deleteConfigurationCode: function(idCod) {
				return $http.delete(ApiUrlMesas + "/configuration/codes/" + idCod);
			},
			updateCodeStatus: function(res_code_status) {
				return $http.patch(ApiUrlMesas + "/configuration/reservations", {}, {
					params: {
						res_code_status: res_code_status
					}
				});
			},
			updatePrivilegeStatus: function(res_privilege_status) {
				return $http.patch(ApiUrlMesas + "/configuration/reservations", {}, {
					params: {
						res_privilege_status: res_privilege_status
					}
				});
			}

		};

	})
	.service('ConfigurationService', function($q, ConfigurationDataService) {
		return {
			getConfig: function() {
				var defered = $q.defer();
				var promise = defered.promise;
				ConfigurationDataService.getConfiguration().success(function(data) {
					data = data.data;
					defered.resolve(data);
				}).error(function(data, status, headers) {
					var response = jsonErrorData(data, status, headers);
					defered.reject(response);
				});
				return promise;
			},
			updateConfig: function(idMicrosite, configuration) {
				var defered = $q.defer();
				var promise = defered.promise;
				ConfigurationDataService.updateConfiguration(idMicrosite, configuration).success(function(data) {
					data = data.data;
					defered.resolve(data);
				}).error(function(data, status, headers) {
					var response = jsonErrorData(data, status, headers);
					defered.reject(response);
				});
				return promise;
			},
			getPercentages: function() {
				var defered = $q.defer();
				var promise = defered.promise;
				ConfigurationDataService.getListPercentage().success(function(data) {
					data = data.data;
					defered.resolve(data);
				}).error(function(data, status, headers) {
					var response = jsonErrorData(data, status, headers);
					defered.reject(response);
				});
				return promise;
			},
			getCode: function() {
				var defered = $q.defer();
				var promise = defered.promise;
				ConfigurationDataService.getConfigurationCode().success(function(data) {
					data = data.data;
					defered.resolve(data);
				}).error(function(data, status, headers) {
					var response = jsonErrorData(data, status, headers);
					defered.reject(response);
				});
				return promise;
			},
			createCode: function(idMicrosite, code) {
				var defered = $q.defer();
				var promise = defered.promise;
				ConfigurationDataService.storeConfigurationCode(idMicrosite, code).success(function(data) {
					data = data.data;
					defered.resolve(data);
				}).error(function(data, status, headers) {
					var response = jsonErrorData(data, status, headers);
					defered.reject(response);
				});
				return promise;
			},
			updateCode: function(idCod, configuration) {
				var defered = $q.defer();
				var promise = defered.promise;
				ConfigurationDataService.updateConfigurationCode(idCod, configuration).success(function(data) {
					data = data.data;
					defered.resolve(data);
				}).error(function(data, status, headers) {
					var response = jsonErrorData(data, status, headers);
					defered.reject(response);
				});
				return promise;
			},
			deleteCode: function(idCod) {
				var defered = $q.defer();
				var promise = defered.promise;
				ConfigurationDataService.deleteConfigurationCode(idCod).success(function(data) {
					data = data.data;
					defered.resolve(data);
				}).error(function(data, status, headers) {
					var response = jsonErrorData(data, status, headers);
					defered.reject(response);
				});
				return promise;
			},
			updateCodeStatus: function(res_code_status) {
				var defered = $q.defer();
				var promise = defered.promise;
				ConfigurationDataService.updateCodeStatus(res_code_status).success(function(data) {
					data = data.data;
					defered.resolve(data);
				}).error(function(data, status, headers) {
					var response = jsonErrorData(data, status, headers);
					defered.reject(response);
				});
				return promise;
			},
			updatePrivilegeStatus: function(res_privilege_status) {
				var defered = $q.defer();
				var promise = defered.promise;
				ConfigurationDataService.updatePrivilegeStatus(res_privilege_status).success(function(data) {
					data = data.data;
					defered.resolve(data);
				}).error(function(data, status, headers) {
					var response = jsonErrorData(data, status, headers);
					defered.reject(response);
				});
				return promise;
			},
		};
	});