/**
 * Created by BS on 25/08/2016.
 */

angular.module('calendar.app', ['calendar.controller', 'calendar.service'])

.config(function($stateProvider) {
	$stateProvider
		.state('mesas.calendar', {
			url: '/calendar',
			templateUrl: '/js/app/tables/calendar/view/index.html',
			controller: 'CalendarIndexController',
			controllerAs: 'vm'
		});
});