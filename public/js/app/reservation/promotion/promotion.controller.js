angular.module('promotion.controller', ['ngFileUpload','ngImgCrop','textAngular','ngEmoticons','localytics.directives'])
.controller('PromotionCtrl', function($scope) {
	
})
.controller('PromotionAddCtrl', function($scope,Upload,$timeout,PromotionFactory,$uibModal) {

	$scope.titulo="Nueva promoción";
	$scope.estados = [{name: 'Activo',value:1},{name: 'Inactivo',value:0}];
	$scope.tipos = [{name: 'Gratis',value:0},{name: 'De pago',value:1}];


  $scope.zoneAvailable = [{id: 1, title: 'Zona01'},{id: 2, title: 'Zona02'},{id: 3, title: 'Zona03'},{id: 4, title: 'Zona04'}];
   //Estados por defecto
  $scope.promotion={caduca:false, tipo:0, estado:1,descripcion:" ",zonaselected: [2, 3]};


  function modalInstances() {
    var modalInstance = $uibModal.open({
      templateUrl: 'myModalContent.html',
      controller: 'TurnoInstanceCtrl',            
    });
  }
        
        //Custom Sizes
  $scope.openModal = function () {
      modalInstances()
  }

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

  /*
  $scope.upload = function (dataUrl, name) {
    Upload.upload({
      url: 'https://angular-file-upload-cors-srv.appspot.com/upload',
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
  */

  $scope.uploadImage = function (file) {
        Upload.upload({
            //url: './public/file/img/promotions',
            url:'http://web.aplication.bookersnap/v1/es/admin/ms/12/reservation/promotion/uploadfile',
            data: {file: file}
        }).then(function (resp) {
            console.log('Success ' + resp.config.data.file.name + ' uploaded. Response: ' + resp.data);
        }, function (resp) {
            console.log('Error status: ' + resp.status);
        }, function (evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
        });
  };


})
.controller('FlyerAddCtrl', function($scope) {

  
  var cleanString=function(cadena){
    var specialChars = "!@#$^&%*()'+=-[]\/{}|:<>?,";
    for (var i = 0; i < specialChars.length; i++) {
      cadena= cadena.replace(new RegExp("\\" + specialChars[i], 'gi'), '');
    }
    cadena = cadena.toLowerCase();
    cadena.replace(/\s/g,"");

    cadena = cadena.replace(/[áàäâå]/gi,"a");
    cadena = cadena.replace(/[éèëê]/gi, 'e');
    cadena = cadena.replace(/[íìïî]/gi, 'i');
    cadena = cadena.replace(/[óòöô]/gi, 'o');
    cadena = cadena.replace(/[úùüû]/gi, 'u');
    cadena = cadena.replace(/[ýÿ]/gi, 'y');
    cadena = cadena.replace(/ñ/gi, 'n');
    return cadena;
  }
  


 	$scope.titulo="Diseñar Flyer";
  
  var str="Ñú12Éá8()'Fbca{4.jpg";
  var nuevo=cleanString(str);
  console.log(nuevo);

})
.controller('TurnoInstanceCtrl', function($scope,$modalInstance) {

  $scope.semana = [{id: 1, nameday: 'Domingo'},{id: 2, nameday: 'Lunes'},{id: 3, nameday: 'Martes'},{id: 4, nameday: 'Miercoles'},{id: 5, nameday: 'Jueves'},{id: 6, nameday: 'Viernes'},{id: 7, nameday: 'Sabado'}];
  $scope.activityAvailable = [{ida: 1, title: 'Reservacion'},{ida: 2, title: 'Comida'},{ida: 3, title: 'Cena'},{ida: 4, title: 'Bar noche'}];

  $scope.ok = function () {
    $modalInstance.close();
  };
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

});
