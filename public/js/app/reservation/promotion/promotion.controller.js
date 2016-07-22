angular.module('promotion.controller', ['ngFileUpload','ngImgCrop','textAngular','ngEmoticons'])
.controller('PromotionCtrl', function($scope) {
	
})
.controller('PromotionAddCtrl', function($scope,Upload,$timeout) {

	$scope.titulo="Nueva promoción";
	$scope.estados = [{name: 'Activo',value:1},{name: 'Inactivo',value:0}];
	$scope.tipos = [{name: 'Gratis',value:0},{name: 'De pago',value:1}];

	//Estados por defecto
	$scope.promotion={caduca:false, tipo:0, estado:1,descripcion:" "};

	//Opciones de calendario
	$scope.today = function() {
        $scope.dt = new Date();
    };
    $scope.today();

    $scope.open = function($event, opened) {
    	$event.preventDefault();
        $event.stopPropagation();
        $scope[opened] = true;
    };

    $scope.dateOptions = {
    	formatYear: 'yy',
        startingDay: 1
    };
    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];

  //Recortar imagen
    $scope.myImage = undefined;
 	  $scope.croppedDataUrl='';   
 	  $scope.imageCropStep = 1;
    
    /*
    var handleFileSelect = function(evt) {
    //$scope.handleFileSelect = function(evt) {
      var file = evt.currentTarget.files[0];
      var fileReader = new FileReader();
      fileReader.onload = function(evt) {
        $scope.$apply(function($scope) {
          $scope.myImage = evt.target.result;
          $scope.imageCropStep = 2;
        });
      };
      fileReader.readAsDataURL(file);
    };
    angular.element(document.querySelector('#fileInput')).on('change', handleFileSelect);
  */

    $scope.clear = function() {
		  $scope.imageCropStep = 1;
		  delete $scope.myImage;
		  delete $scope.croppedDataUrl;
    };

  //
  $scope.upload = function (dataUrl, name) {
    Upload.upload({
      url: 'http://web.aplication.bookersnap/public/file/img/promotions',
        data: {
          file: Upload.dataUrltoBlob(dataUrl, name)
        },
      }).then(function (response) {
        $timeout(function () {
          $scope.result = response.data;
        });
      }, function (response) {
        if (response.status > 0) $scope.errorMsg = response.status + ': ' + response.data;
        }, function (evt) {
            $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
    });
  }

})
.controller('FlyerAddCtrl', function($scope) {

	$scope.titulo="Diseñar Flyer";

})

