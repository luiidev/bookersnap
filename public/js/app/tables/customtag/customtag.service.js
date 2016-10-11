angular.module('customtag.service', [])
	.service('CustomTagGuestDataService', function($http, ApiUrlMesas) {
		return {
			getListTagGuestCustom: function() {
				return $http.get(ApiUrlMesas + "/guest-tags");
			},
			createTagGuestCustom: function(name) {
				return $http.put(ApiUrlMesas + "/guest-tags", {}, {
					params: {
						name: name
					}
				});
			},
			deleteTagGuestCustom: function(idTag) {
				return $http.delete(ApiUrlMesas + "/guest-tags/" + idTag);
			},
		};
	})
	.service('CustomTagReservationDataService', function($http, ApiUrlMesas) {
		return {
			getListTagReservationCustom: function() {
				return $http(ApiUrlMesas + "/reservation/tag");
			},
			createTagReservationCustom: function(name) {
				return $http(ApiUrlMesas + "/reservation/tag", {}, {
					params: {
						name: name
					}
				});
			},
			deleteTagReservationCustom: function(idTag) {
				return $http(ApiUrlMesas + "reservation/tag/" + idTag);
			},
		};
	})
	.service('CustomTagGuestService', function($q, CustomTagGuestDataService) {
		return {
			getAllTag: function() {
				var defered = $q.defer();
				CustomTagGuestDataService.getListTagGuestCustom().success(function(data) {
					data = data.data;
					defered.resolve(data);
				}).error(function(data, status, headers) {
					var response = jsonErrorData(data, status, headers);
					defered.reject(response);
				});
				return defered.promise;
			},
			createTag: function(name) {
				var defered = $q.defer();
				CustomTagGuestDataService.createTagGuestCustom(name).success(function(data) {
					data = data.data;
					defered.resolve(data);
				}).error(function(data, status, headers) {
					var response = jsonErrorData(data, status, headers);
					defered.reject(response);
				});

				return defered.promise;
			},
			deleteTag: function(idTag) {
				var defered = $q.defer();
				var promise = defered.promise;
				CustomTagGuestDataService.deleteTagGuestCustom(idTag).success(function(data) {
					data = data.data;
					defered.resolve(data);
				}).error(function(data, status, headers) {
					var response = jsonErrorData(data, status, headers);
					defered.reject(response);
				});
				return promise;
			},

			findWithAttr: function(array, attr, value) {
				for (var i = 0; i < array.length; i += 1) {
					if (array[i][attr] === value) {
						return i;
					}
				}
				return -1;
			},

		};
	}).service('CustomTagReservationService', function($q, CustomTagReservationDataService) {
		return {
			getAllTag: function() {
				var defered = $q.defer();
				var promise = defered.promise;
				CustomTagReservationDataService.getListTagReservationCustom().success(function(data) {
					data = data.data;
					defered.resolve(data);
				}).error(function(data, status, headers) {
					var response = jsonErrorData(data, status, headers);
					defered.reject(response);
				});
				return promise;
			},
			createTag: function(name) {
				var defered = $q.defer();
				var promise = defered.promise;
				CustomTagReservationDataService.createTagReservationCustom(name).success(function(data) {
					data = data.data;
					defered.resolve(data);
				}).error(function(data, status, headers) {
					var response = jsonErrorData(data, status, headers);
					defered.reject(response);
				});
				return promise;

			},
			deleteTag: function(id) {
				var defered = $q.defer();
				var promise = defered.promise;
				CustomTagReservationDataService.deleteTagReservationCustom(id).success(function(data) {
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