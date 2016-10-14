angular.module('block.app', ['block.controller', 'block.service', 'block.directive'])
	.constant("screenSizeBlock", {
		minSize: 675,
		header: 112,
		menu: 400
	})
	.config(function($stateProvider, $urlRouterProvider) {
		$stateProvider
			.state('mesas.floor.block', {
				url: '/:date/block',
				views: {
					'@': {
						templateUrl: '/js/app/tables/block/view/create.old.html',
						controller: 'blockCtr',
						cache: false,
					}
				},
				resolve: {
					$title: function() {
						return 'Crear Bloqueos';
					}
				}
			})
			.state('mesas.floor.blockEdit', {
				url: '/:date/block/:block_id',

				views: {
					'@': {
						templateUrl: '/js/app/tables/block/view/edit.new.html',
						controller: "blockCtr",
					}
				},
				resolve: {
					$title: function() {
						return 'Editar Bloqueo';
					}
				}
			});

	});