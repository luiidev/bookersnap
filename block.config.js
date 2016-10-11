angular.module('block.app', ['block.controller','block.service','block.directive'])
.config(function ($stateProvider, $urlRouterProvider){
	$stateProvider
		.state ('mesas.block', {
			url: '/block/:date',
			templateUrl: '/js/app/tables/block/view/create.old.html',
                        controller: "blockCtr",
                        cache: false
		})
		.state ('mesas.blockEdit', {
			url: '/block/:date/:block_id',
			templateUrl: '/js/app/tables/block/view/edit.new.html',
                        controller: "blockCtrEdit",                        
                        cache: false
		})
    
});