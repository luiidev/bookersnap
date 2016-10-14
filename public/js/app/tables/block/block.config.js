angular.module('block.app', ['block.controller', 'block.service', 'block.directive'])
	.constant("screenSizeBlock", {
		minSize: 675,
		header: 112,
		menu: 400
	})
	.config(function($stateProvider, $urlRouterProvider) {
		$stateProvider
			.state('mesas.block', {
				url: '/floor/:date/block',
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
			.state('mesas.blockEdit', {
				url: '/floor/:date/block/:block_id',
				templateUrl: '/js/app/tables/block/view/edit.new.html',
				controller: "blockCtr",
				cache: false,
				resolve: {
					$title: function() {
						return 'Editar Bloqueo';
					}
				}
			});

	});