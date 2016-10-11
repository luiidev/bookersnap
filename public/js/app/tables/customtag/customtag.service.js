angular.module('customtag.service', [])
	.service('CustomTagDataService', function($http, ApiUrlMesas) {
		return {
			getListTagCustom: function() {
				return $http.get(ApiUrlMesas + "/guest-tags");
			},
			createTagCustom: function(name) {
				return $http.put(ApiUrlMesas + "/guest-tags", {}, {
					params: {
						name: name
					}
				});
			},
			deleteTagCustom: function(idTag) {
				return $http.delete(ApiUrlMesas + "/guest-tags/" + idTag);
			},
		};
	})
	.service('CustomTagService', function($q, CustomTagDataService) {
		return {
			getAllTag: function() {
				var defered = $q.defer();
				CustomTagDataService.getListTagCustom().success(function(data) {
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
				CustomTagDataService.createTagCustom(name).success(function(data) {
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
				CustomTagDataService.deleteTagCustom(idTag).success(function(data) {
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
	});