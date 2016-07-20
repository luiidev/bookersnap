angular.module('promotion.controller', [])
.controller('PromotionCtrl', function($scope) {
	
})
.controller('PromotionAddCtrl', function($scope) {

	$scope.titulo="Nueva promoción";
	$scope.estados = [{name: 'Activo',value:'1'},{name: 'Inactivo',value:'0'}];
	$scope.tipos = [{name: 'De pago',value:'1'},{name: 'Gratis',value:'0'}];

	$scope.promotion={caduca:false};
	$scope.showControl=function(){
  		alert($scope.promotion.caduca);
	}

})
.controller('FlyerAddCtrl', function($scope) {

	$scope.titulo="Diseñar Flyer";

})

