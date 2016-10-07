angular.module('zone.app', ['zone.controller', 'zone.service', 'zone.directive'])
	.config(function($stateProvider, $urlRouterProvider, $httpProvider) {

		$stateProvider
			.state('mesas.zone', {
				url: '/config/zone',
				views: {
					'@': {
						templateUrl: '/js/app/tables/zone/view/index.html',
						controller: 'ZoneCtrl',
					}

				},
				resolve: {
					$title: function() {
						return 'Lista de zonas';
					}
				}
			})
			.state('mesas.zone.active', {
				url: '/zone-active',
				templateUrl: '/js/app/tables/zone/view/zone-active.html',
				resolve: {
					$title: function() {
						return 'Lista de zonas activas';
					}
				}
			})
			.state('mesas.zone.inactive', {
				url: '/zone-inactive',
				templateUrl: '/js/app/tables/zone/view/zone-inactive.html',
				resolve: {
					$title: function() {
						return 'Lista de zonas inactivas';
					}
				}
			})
			.state('mesas.zone.create', {
				url: '/new',
				views: {
					'@': {
						templateUrl: '/js/app/tables/zone/view/zone-create.html',
						controller: 'ZoneCreateCtrl',
					}

				},
				resolve: {
					$title: function() {
						return 'Crear zona';
					}
				}
			})
			.state('mesas.zone.edit', {
				url: '/:id',
				views: {
					'@': {
						templateUrl: '/js/app/tables/zone/view/zone-edit.html',
						controller: 'ZoneCreateCtrl',
					}

				},
				resolve: {
					$title: function() {
						return 'Editar zona';
					}
				}
			})
			.state('mesas.zone.clone', {
				url: '/:id/clone',
				views: {
					'@': {
						templateUrl: '/js/app/tables/zone/view/zone-clone.html',
						controller: 'ZoneCreateCtrl',
					}

				},
				resolve: {
					$title: function() {
						return 'Clonar zona';
					}
				}
			});

	});