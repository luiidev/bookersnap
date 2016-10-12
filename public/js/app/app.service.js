angular.module("bookersnap.services", [])

.factory('MenuConfigFactory', function($timeout) {
	return {
		menuActive: function(index) {

			$timeout(function() {
				angular.element("#menu-config li").removeClass("active");
				angular.element("#menu-config li").eq(index).addClass("active");
			}, 500);

		}
	};

})

.factory('HttpFactory', function($http) {
	return {
		get: function(httpUrl, config, objectData, reload) {

			if (reload === true) objectData = null;
			if (objectData) return objectData;

			return $http.get(httpUrl, config);

		}
	};
})

;