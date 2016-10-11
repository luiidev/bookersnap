angular.module('customtag.service', [])
	.service('CustomTagDataService', function($http, ApiUrlMesas) {
		return {
			getListTagCustom: function() {

				return $http.get(ApiUrlMesas + "/guest-tags");
			},
			createTagCustom: function(name) {
				return $http.post(ApiUrlMesas + "/guest-tags/");
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
				}).error(function(response) {
					defered.reject(response);
				});
				return defered.promise;
			},
			createTag: function() {

			},
			deleteTag: function() {

			},

		};
	});