angular.module('configuration.service', [])
	.service('ConfigurationDataService', function($http, ApiUrlMesas) {
		return {
			getConfiguration: function() {
				return $http.get(ApiUrlMesas + "/configuration/reservation");
			},
			updateConfiguration: function(idMicrosite) {
				return $htpp.put(ApiUrlMesas + "/configuration/reservation/" + idMicrosite);
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
			updateConfig: function(idMicrosite) {
				var defered = $q.defer();
				var promise = defered.promise;
				ConfigurationDataService.updateConfiguration(idMicrosite).success(function(data) {
					data = data.data;
					defered.resolve(data);
				}).error(function(data, status, headers) {
					var response = jsonErrorData(data, status, headers);
					defered.reject(response);
				});
				return promise;
			}
		};
	});