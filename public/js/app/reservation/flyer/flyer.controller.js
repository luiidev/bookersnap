angular.module('flyer.controller', ['ngFileUpload','farbtastic','localytics.directives'])
.controller('FlyerAddCtrl', function($scope,Upload,FlyerFactory,AppBookersnap) {

 	$scope.titulo="Diseñar Flyer";

  $scope.textFlyer=[];
  $scope.textActive=false;
  $scope.textAplica=false;
  $scope.textIndex=0;

  var getLabel=function(){
  FlyerFactory.getLabel().success(function(data){
    var vTexto = [];
    angular.forEach(data['data'], function(label) {
          vTexto.push(label); 
    });
    $scope.flyer.labels = vTexto;
    $scope.flyer.labelSelected=$scope.flyer.labels[0];
  });
  }

  var getTypographys=function(){
  FlyerFactory.getTypographys().success(function(data){
    var vTipography = [];
    angular.forEach(data['data'], function(tipography) {
          vTipography.push(tipography); 
    });
    $scope.flyer.fonts = vTipography;
    $scope.flyer.fontSelected=$scope.flyer.fonts[0];
  });
  }


  $scope.flyer={
    //sizes:[{id:10, valor: '10px'},{id:12, valor: '12px'},{id: 14, valor: '14px'},{id: 16, valor: '16px'}],
    sizeSelected:{id: 14, valor: '14px'},
    colorSelected:{color: '#03A9F4'},
    //states:[{name: 'Activo',value:1},{name: 'Inactivo',value:0}],
    //stateSelected:{value: 1}
  }
  getLabel();
  getTypographys();

  /*Agregar datos a un array textFlyer*/
  $scope.addText=function(){
    if ($scope.flyer.labelSelected) {

        if($scope.textFlyer.length==0){
          crearTexto();
        }else{
          var exists = false;
          angular.forEach($scope.textFlyer, function(objetos) {
            if($scope.flyer.labelSelected.label_id==objetos.label.label_id){
                exists = true;
                messageAlert("Flyer","Texto ya se encuentra ubicado sobre el flyer","warning");
            }          
          });
          if (exists === false) {
            crearTexto();
          }
        }
        
    }else{
      messageAlert("Flyer","Debe seleccionar un texto","warning");
    }
  }

  var crearTexto=function(){
    var texto={
      label:$scope.flyer.labelSelected,
      typography:{typography_id:$scope.flyer.fontSelected.typography_id,name:$scope.flyer.fontSelected.name},
      font_size:$scope.flyer.sizeSelected.id+"px",
      color:$scope.flyer.colorSelected.color
      //top:Math.floor((Math.random() * 100) + 40)+"px",
      //left: Math.floor((Math.random() * 300) + 40)+"px"
    };
    $scope.textFlyer.push(texto);
    cleanText();
  }

  $scope.changeFunction=function(){
    $scope.textActive=false;
  }
  /*Obtener datos de texto seleccionado*/
  $scope.selectedText=function(index){
    $scope.textIndex=index;
    $scope.flyer.labelSelected=$scope.textFlyer[index].label;
    $scope.flyer.fontSelected={typography_id:$scope.textFlyer[index].typography.typography_id,name:$scope.textFlyer[index].typography.name};
    $scope.flyer.sizeSelected.id= $scope.textFlyer[index].font_size.replace("px","");
    $scope.flyer.colorSelected.color=$scope.textFlyer[index].color;
    $scope.textActive=true;
    $scope.textAplica=true;
    //console.log("selectedText "+angular.element('.text-flyer').eq(index).css("top"));
  }

  $scope.autoPropiedad = function () {
    if($scope.textFlyer.length!=0 && $scope.textAplica==true){
      $scope.textFlyer[$scope.textIndex].font_size=$scope.flyer.sizeSelected.id+"px";
      $scope.textFlyer[$scope.textIndex].color=$scope.flyer.colorSelected.color;
      $scope.textFlyer[$scope.textIndex].typography={typography_id:$scope.flyer.fontSelected.typography_id,name:$scope.flyer.fontSelected.name};
      //$scope.flyer.sizeSelected={id: 14, valor: '14px'};
    }
  };
  
  /*Eliminar dato del array textFlyer*/
  $scope.deleteText=function(){
    $scope.textFlyer.splice($scope.textIndex,1);
    $scope.textActive=false;
    $scope.textAplica=false;
    cleanText();
  }

  var cleanText=function(){
    $scope.flyer.labelSelected=$scope.flyer.labels[0];
    //$scope.flyer.fontSelected={id: 'Arial', title: 'Arial'};
    //$scope.flyer.sizeSelected={id: 14, valor: '14px'};
    //$scope.flyer.colorSelected={color: '#03A9F4'};
  }

  $scope.noEditar=function(){
    $scope.textActive=false;
    cleanText();
  }

  $scope.existeFlyer=false;
  $scope.uploadImageFlyer = function (file) {
      Upload.upload({
        url: AppBookersnap+'/promotion/uploadFile',
          data: {file: file}
        }).then(function (resp) {
          $scope.imagetmp=resp.data
          $scope.existeFlyer=true;
          console.log('Json: '+angular.toJson(resp.data,true));
        },function (resp) {
          $scope.existeFlyer=false;
          console.log('Error status: ' + resp.status);
    });
  };
 
  $scope.clearImageFlyer = function() {
      delete $scope.coleccion.fileimg;
  };

/*
  var generateFlyer=function(){

    html2canvas(angular.element('.svgArea'), {
      onrendered: function(canvas) {

        theCanvas = canvas;
        var img = canvas.toDataURL("image/png");
        //Canvas2Image.convertToPNG(canvas);
        document.body.appendChild(canvas);
        //uploadFile64(img);
        //console.log(img);
      }
    });

  }
  */
  //console.log($scope.existeFlyer);
  $scope.saveFlyer=function(){
    if($scope.existeFlyer){ 

      angular.forEach($scope.textFlyer, function(data,index){
      //data.label_id="1";
      //data.x=angular.element('.text-flyer').eq(index).css("left");
      data.coodinates={
        x:angular.element('.text-flyer').eq(index).css("left"),
        y:angular.element('.text-flyer').eq(index).css("top")
      }

      })

      //generateFlyer();
      $scope.principal={
        "microsite_id":1,
        "event_id":1,
        "token":"abc123456",
        //"status":$scope.flyer.stateSelected.value,
        "image":$scope.imagetmp.basename,
        "image_fullname":$scope.imagetmp.fullname,
        "label":$scope.textFlyer
      };
      console.log("General  "+angular.toJson($scope.principal,true));
      messageAlert("Flyer","Se ha adjuntado correctamente el flyer","success");

    }else{ 
        messageAlert("Flyer","Debe seleccionar una imagen para el flyer","warning");
    };
    
  }

})
