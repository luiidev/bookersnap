angular.module('flyer.controller', ['ngFileUpload','farbtastic','localytics.directives'])
.controller('FlyerAddCtrl', function($scope,$state,$stateParams,Upload,FlyerFactory,ApiUrlReservation, $http, AppBookersnap,UrlGeneral, UrlRepository) {

  $scope.titulo="Diseñar Flyer";
  $scope.textFlyer=[];
  $scope.textActive=false;
  $scope.textAplica=false;
  $scope.textIndex=0;
  $scope.existFlyer = false; // Estado que nos dice si existe el flyer en la base de datos
  $scope.flyer_id = "";
  $scope.postFlyer = [];

  var getLabel=function(){
    FlyerFactory.getLabel().success(function(response){
      
      var vTexto = [];
      angular.forEach(response['data']['label'], function(item) {
            vTexto.push(item); 
      });
      
      $scope.flyer.labels = vTexto;
      $scope.flyer.labelSelected=$scope.flyer.labels[0];
      
    });
  }

  var getTypographys=function(){
    FlyerFactory.getTypographys().success(function(data){

      var vTipography = [];
      angular.forEach(data['data']['typographys'], function(tipography) {
            vTipography.push(tipography); 
      });
      $scope.flyer.fonts = vTipography;
      $scope.flyer.fontSelected=$scope.flyer.fonts[0];
      
    });
  }

  var getFlyer=function(){
    var id_flyer = $stateParams.id;
    FlyerFactory.getFlyer(id_flyer).success(function(response){

      /* Estado para identificar cuando se registra o actualiza el flyer 
      *  True = Update
      *  False = Create 
      */
      if(response.success){
        console.dir(response.data.flyerlabel[0]);
        $scope.existFlyer = response.success;
        $scope.existeFlyer=true; // Si la imagen esta cargada es TRUE
        angular.forEach(response.data.flyerlabel, function(data,index){

          var coordenada = data.coodinates.split(",");
          var texto={
          label: {
                  label_id:data.flyer_label_id,
                  name: data.label,
                 },
          typography:{typography_id: data.tipografy},
          font_size: data.font_size + "px",
          color:data.color,
          left: coordenada[0]+"px",
          top:coordenada[1]+"px",
          };

          $scope.textFlyer.push(texto);

        });

         /** CARGA DE IMAGEN A LA VISTA **/
        $scope.coleccion = {
         fileimg: UrlRepository + '/flyer/' + response.data.image,
        }
        

        var handleFileSelect=function(evt) {
               var file=evt.currentTarget.files[0];
               var reader = new FileReader();
               reader.onload = function (evt) {
                 $scope.$apply(function($scope){
                   $scope.coleccion.fileimg=evt.target.result;
                 });
               };
               reader.readAsDataURL(file);
             };
        angular.element(document.querySelector('#fileInput')).on('change',handleFileSelect);
        /** FIN CARGA DE IMAGEN A LA VISTA **/

      }
    });
  }

  $scope.flyer = {
    sizeSelected:{id: 14, valor: '14px'},
    colorSelected:{color: '#03A9F4'},
  }

  getFlyer();
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
  }

  $scope.autoPropiedad = function () {
    if($scope.textFlyer.length!=0 && $scope.textAplica==true){
      $scope.textFlyer[$scope.textIndex].font_size=$scope.flyer.sizeSelected.id+"px";
      $scope.textFlyer[$scope.textIndex].color=$scope.flyer.colorSelected.color;
      $scope.textFlyer[$scope.textIndex].typography={typography_id:$scope.flyer.fontSelected.typography_id,name:$scope.flyer.fontSelected.name};

    }
  };
  
  /* Eliminar dato del array textFlyer */
  $scope.deleteText=function() {
    $scope.textFlyer.splice($scope.textIndex,1);
    $scope.textActive=false;
    $scope.textAplica=false;
    cleanText();
  }

  var cleanText=function() {
    $scope.flyer.labelSelected=$scope.flyer.labels[0];
  }

  $scope.noEditar=function() {
    $scope.textActive=false;
    cleanText();
  }

  $scope.existeFlyer=false;
  $scope.uploadImageFlyer = function (file) {
      
    if(file!=null){
        Upload.upload({
          url: AppBookersnap+'/flyer/uploadFile',
            data: {file: file}
          }).then(function (resp) {
            $scope.imagetmp = resp.data;
            $scope.existeFlyer=true;

          },function (resp) {
            $scope.existeFlyer=false;
            console.log('Error status: ' + resp.status);
      });
    }
  };
  
  $scope.clearImageFlyer = function() {
      $scope.existeFlyer=false;
      delete $scope.coleccion.fileimg;
  };


  $scope.saveFlyer=function(){

    /* Se construye el array con la estructura que recibe el API*/
    $scope.label = [];

    if($scope.existeFlyer){ // Para validar si se selecciono una imagen

      if($scope.existFlyer==false){ // Para saber si existe registrado dentro de la Base de datos

        angular.forEach($scope.textFlyer, function(data,index){
        
          var ejeX= angular.element('.text-flyer').eq(index).css("left").replace("px","");
          var ejeY= angular.element('.text-flyer').eq(index).css("top").replace("px","");  

          $scope.label.push({
            label_id : data.label.label_id,
            coodinates: ejeX +","+ejeY,
            font_size: data.font_size,
            tipografy: data.typography.typography_id,
            color: data.color,
          });    

        });

        $scope.postFlyer = {
          "microsite_id": obtenerIdMicrositio(),
          "event_id": $stateParams.id,
          "token": "abc123456",
          "image": (typeof($scope.imagetmp)!="undefined")?$scope.imagetmp.basename:"",
          "image_fullname":(typeof($scope.imagetmp)!="undefined")?$scope.imagetmp.fullname:"",
          "status": 1,  
          "label": $scope.label,
        }  
      
        $http({
            method : "POST",
            data: $scope.postFlyer,
            url : AppBookersnap + '/flyer',
        }).then(function mySucces(response) {
            console.log(response);
            if(response.data.success == true ){
              messageAlert("Success", "Guardado exitoso" , "success", 2000);
              $state.go("reservation.promotion-list");
            }
        }, function myError(response) {
            console.log("Error:",response);
        });   

      }else{

        angular.forEach($scope.textFlyer, function(data,index){
          console.log(data);
          /* Etiquetas superiores */
          var headX = parseInt(angular.element('.text-flyer').eq(index).css("left").replace("px",""));
          var headY =  parseInt(angular.element('.text-flyer').eq(index).css("top").replace("px",""));
          console.clear();
          
          /* Etiquetas internas del texto */
          var etiquetaX= parseInt(angular.element('.etiqueta').eq(index).css("left").replace("px",""));
          var etiquetaY= parseInt(angular.element('.etiqueta').eq(index).css("top").replace("px",""));

          /* Se inserta la coordenada final siempre y cuando se muevan las etiquetas de lo 
          contrario se mantienen las mismas coordenadas tomando como referencia las que estan en las etiquetas 
          interiores */
          var ejeX = (headX==0)?etiquetaX:(etiquetaX + headX);
          var ejeY = (headY==0)?etiquetaY:(etiquetaY + headY);
          
           $scope.label.push({
            label_id : data.label.label_id,
            coodinates: ejeX +","+ejeY,
            font_size: data.font_size,
            tipografy: data.typography.typography_id,
            color: data.color,
          });    
          
        });
        
        $scope.postFlyer = {
          "microsite_id": obtenerIdMicrositio(),
          "event_id": $stateParams.id,
          "token": "abc123456",
          "image": (typeof($scope.imagetmp)!="undefined")?$scope.imagetmp.basename:"",
          "image_fullname":(typeof($scope.imagetmp)!="undefined")?$scope.imagetmp.fullname:"",
          "status": 1,  
          "label": $scope.label,
        } 
        
        $http({
            method : "PUT",
            data: $scope.postFlyer,
            url : AppBookersnap + '/flyer/' + $stateParams.id,
        }).then(function mySucces(response) {
            messageAlert("Success", "Actualizacion exitoso" , "success", 2000);
            $state.go("reservation.promotion-list");
        }, function myError(response) {
            console.log("Error:",response);
        });
        
      } 
        
        
    }else{ 
        messageAlert("Flyer","Debe seleccionar una imagen para el flyer","warning");
    };  
        
  }     

})
