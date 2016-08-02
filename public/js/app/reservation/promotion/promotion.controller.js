angular.module('promotion.controller', ['ngFileUpload','ngImgCrop','textAngular','ngEmoticons','farbtastic','localytics.directives'])
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

 	$scope.titulo="Diseñar Flyer";

  $scope.textFlyer=[];
  $scope.textActive=false;
  $scope.textIndex=0;

  $scope.flyer={
    fonts:[{id: 0, title: 'Arial'},{id: 1, title: 'Verdana'},{id: 2, title: 'Roboto'}],
    fontSelected:{id: 0, title: 'Arial'},
    sizes:[{id:10, valor: '10px'},{id:12, valor: '12px'},{id: 14, valor: '14px'}],
    sizeSelected:{id: 14, valor: '14px'},
    colorSelected:{color: '#03A9F4'},
    label:""
  }

  $scope.changeFunction = function() {
    angular.forEach($scope.flyer.fonts, function(fonts){
       angular.element('.svg').removeClass(fonts.id);
    })
   
    angular.element('.svg').addClass($scope.flyer.fontSelected);
  }
  
  $scope.addText=function(){
        var texto={
          label:$scope.flyer.label,
          font:$scope.flyer.fontSelected.id,
          size:$scope.flyer.sizeSelected.id+"px",
          color:$scope.flyer.colorSelected.color,
          top:Math.floor((Math.random() * 360) + 40)+"px",
          left: Math.floor((Math.random() * 500) + 40)+"px"

        };
         $scope.textFlyer.push(texto);
         cleanText();
  }

  $scope.updateText=function(){
    $scope.textFlyer[$scope.textIndex].label=$scope.flyer.label;
    $scope.textFlyer[$scope.textIndex].font=$scope.flyer.fontSelected.id;
    $scope.textFlyer[$scope.textIndex].size=$scope.flyer.sizeSelected.id+"px";
    $scope.textFlyer[$scope.textIndex].color=$scope.flyer.colorSelected.color;   
    $scope.textActive=false;
    cleanText();
  }

  $scope.selectedText=function(index){
    $scope.textIndex=index;
    $scope.flyer.label=$scope.textFlyer[index].label;
    $scope.flyer.fontSelected={id:$scope.textFlyer[index].font,title:$scope.textFlyer[index].font};
    $scope.flyer.sizeSelected.id= $scope.textFlyer[index].size.replace("px","");
    $scope.flyer.colorSelected.color=$scope.textFlyer[index].color;
    $scope.textActive=true;
  }

  $scope.deleteText=function(){
    $scope.textFlyer.splice($scope.textIndex,1);
    $scope.textActive=false;
    cleanText();
  }

  var cleanText=function(){

    $scope.flyer.label="";
    $scope.flyer.fontSelected={id: 0, title: 'Arial'};
    $scope.flyer.sizeSelected={id: 14, valor: '14px'};
    $scope.flyer.colorSelected={color: '#03A9F4'};

  }



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
