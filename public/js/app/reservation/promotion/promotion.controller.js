angular.module('promotion.controller', ['ngFileUpload','ngImgCrop','textAngular','ngEmoticons'])

.controller('PromotionCtrl', function($scope) {
  $scope.titulo="Promociones";
})

.controller('PromotionAddCtrl', function($scope,$state,$stateParams,Upload,$timeout,$uibModal,PromotionFactory,TurnosPromotionFactory,TableFactory) {

  
  var promotionId = $stateParams.id;
  $scope.promotion={};

  if(promotionId){
    $scope.titulo="Actualizar promoción";
    PromotionFactory.getPromotion(12).success(function(data){
      var promotion=data.data;
      var vPromotion = [];
      var dataPromotion = {
        "titulo":promotion.titulo,
        "description":promotion.description,
        "status_expire":TableFactory.getEvalua(promotion.status_expire),
        "date_expire":promotion.date_expire,
        "publication":TableFactory.getEvalua(promotion.publication),
        "tipoSelected":{type_event_id : promotion.type_event},
        "status":[{name:'Vigente',value:1},{name:'Deshabilitado',value:2}],
        "statusSelected":{value : promotion.status},
        "myImage":promotion.imagen,
        "turn": promotion.turn
      }
      vPromotion.push(dataPromotion);
      getTypes();
      getZones();
      $scope.promotion=vPromotion[0];
      console.log($scope.promotion);
    });
  }else{
    $scope.titulo="Nueva promoción";
    $scope.promotion={
      titulo:"",
      description : "",
      status_expire : false,
      date_expire : "",
      publication:false,
      status:[{name:'Vigente',value:1},{name:'Deshabilitado',value:2}],
      statusSelected:{value:1},
      myImage: undefined
    };
    //getTypes();
    //getZones();
  }

  var getZones = function(){
  PromotionFactory.getZones().success(function(data){
    var vZones = [];
    angular.forEach(data['data'], function(zones) {
      var tables = zones.table;
      var vTables = [];
      angular.forEach(tables, function(table) {
        var position = table.config_position.split(",");
        var dataTable = {
          name_zona : zones.name,
          table_id: table.table_id,
          name : table.name,
          minCover : table.min_cover,
          maxCover : table.max_cover,
          left : position[0],
          top : position[1],
          shape : TableFactory.getLabelShape(table.config_forme),
          size : TableFactory.getLabelSize(table.config_size),
          rotate : table.config_rotation,
          price : table.price,
        }
        vTables.push(dataTable); 
      });
      var dataZone = {
        zone_id : zones.zone_id,
        name :  zones.name,
        table : vTables,
      }
      vZones.push(dataZone);
    });
    $scope.promotion.zonas = vZones;
    //console.log(vZones);
  });
  };

  var getTypes = function(){
    PromotionFactory.getTypes().success(function(data){
      var vTypes = [];
      angular.forEach(data['data'], function(types) {
        vTypes.push(types); 
      });
      $scope.promotion.tipos = vTypes;

      if(!promotionId){
        $scope.promotion.tipoSelected=$scope.promotion.tipos[0];
      }
      
    });
  };

  getTypes();
  getZones();
  
  //$scope.cropped = [{w: 200, h: 80}];
  $scope.cropped={cropWidth:100,cropHeight:100,cropTop:0,cropLeft:10}

  /*$scope.imgPreview=[];
  var datosPreview={
    sizes:{w:$scope.cropped.cropWidth,h:$scope.cropped.cropHeight},
    coodinates:{x:$scope.cropped.cropLeft,y:$scope.cropped.cropTop}
  };
  $scope.imgPreview.push(datosPreview);*/
  $scope.addCroppingWatcher=function(){ console.log('hecho');}

  $scope.validarImg=function(file){
    if(file==null){ 
      messageAlert("Flyer","Seleccione imagen mayor a 300px x 300px","warning");
      delete $scope.promotion.myImage;
    }
  }
  
  $scope.modalContent=TurnosPromotionFactory.getTurnosItems();

  $scope.savePromotion=function(option){

    //uploadImage($scope.promotion.myImage);
    //uploadImage64($scope.croppedDataUrl);

    $scope.lstTurn=TurnosPromotionFactory.getTurnosItems();

    var date_expire ='';
    if($scope.promotion.status_expire==true){
      fecha_caduca=$scope.promotion.date_expire;
    }else{
      date_expire='';
    }

    var imagen='';
    if($scope.promotion.myImage){
      imagen=cleanString($scope.promotion.myImage.name);
    }else{
      imagen='';
    }
    //console.log($scope.promotion.myImage);

   
    var datosPromotion={
      "microsite_id":1,
      "event_id":1,
      "token":"abc123456",
      "titulo":$scope.promotion.titulo,
      "description":$scope.promotion.description,
      "status_expire":$scope.promotion.status_expire,
      "date_expire":date_expire ,
      "publication":$scope.promotion.publication,
      "tipo":$scope.promotion.tipoSelected.value,
      "status":$scope.promotion.statusSelected.value,
      "image":imagen,
      "turn": $scope.lstTurn
    };

    /*
    if (option == "create") {

      PromotionFactory.createPromotion(datosPromotion).success(function(response){
        messageAlert("Success","Zone create complete","success");
        //$state.reload();
      }).error(function(data,status,headers){
        messageErrorApi(data,"Error","warning");
      });

    }else{
      datosPromotion.id = $stateParams.id;
      PromotionFactory.editPromotion(datosPromotion).success(function(response){
        messageAlert("Success","Zone edit complete","success");
        //$state.go('zone.active');
      }).error(function(data,status,headers){
        messageErrorApi(data,"Error","warning");
      });
    }
    */
    console.log('Guardando'+angular.toJson(datosPromotion,true));
    //console.log(TurnosPromotionFactory.getTurnosItems());
  }

  
  

  function modalInstances(animation, size, backdrop, keyboard) {
    var modalInstance = $uibModal.open({
      animation: animation,
      templateUrl: 'myModalContent.html',
      controller: 'TurnoInstanceCtrl',
      size: size,
      resolve: {
        content: function () {
          return $scope.modalContent;
        }
      }
    });
  } 
  //Custom Sizes
  $scope.openModal = function (size) {
    modalInstances(true, size, true, true)
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


  $scope.clearImagePromotion = function() {
    delete $scope.promotion.myImage;
    delete $scope.croppedDataUrl;
  };


  var uploadImage = function (file) {
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

        var uploadImage64=function(file){
          Upload.upload({
            url:'http://web.aplication.bookersnap/v1/es/admin/ms/12/reservation/promotion/uploadfile64',
            data: {file: file}
          }).then(function (resp) {
            console.log(resp);
            //console.log('Success ' + resp.config.data.file.name + ' uploaded. Response: ' + resp.data);
          }, function (resp) {
            console.log('Error status: ' + resp.status);
          }, function (evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
          });
        }


        /********************************************/
        $scope.invocarZonas=function(item){
          openModalZones();
        }

        var openModalZones = function () {
          modalInstancesZones()
        }

        function modalInstancesZones() {
          var modalInstance = $uibModal.open({
            templateUrl: 'myModalContentZone.html',
            controller: 'ZoneInstanceCtrl',
            size: 'lg',
            resolve: {
              content: function () {
                return $scope.promotion.zonas;
              }
            }
          });
        } 

      })

.controller('TurnoInstanceCtrl', function($scope,$modalInstance,$filter,TurnosPromotionFactory,content) {

  $scope.listTurnos = content;
    //console.log('Hay '+ angular.toJson(content, true));
    //$scope.listTurnos=TurnosPromotionFactory.getTurnosItems();
    $scope.turnoIndex=0;

    var cantidad=$scope.listTurnos.length;
    if(cantidad>0){
      $scope.existeTurno=true;
    }else{
      $scope.existeTurno=false;
    }

    $scope.turnos = {
      actividades:[
      {id: 1, name: 'Reservacion'},
      {id: 2, name: 'Comida'},
      {id: 3, name: 'Cena'},
      {id: 4, name: 'Bar noche'},
      ],
      semana:[
      {id : 0, label : 'Domingo',disabled : false,checked : false},
      {id : 1, label : 'Lunes',disabled : false,checked : false},
      {id : 2, label : 'Martes',disabled : false,checked : false},
      {id : 3, label : 'Miercoles',disabled : false,checked : false},
      {id : 4, label : 'Jueves',disabled : false,checked : false},
      {id : 5, label : 'Viernes',disabled : false,checked : false},
      {id : 6, label : 'Sabado',disabled : false,checked : false},
      ],
      //actividadSelected : {id: 1, name: 'Reservacion'},
      turnoSelected:[],
      hours_ini : '',
      hours_end : '',
      disposiciones:[{id:1,name:'Aplicar siempre'},{id:2,name:'Añadir turno a la promocion'}],
      disposicionSelected:{id:1, name:'Aplicar siempre'},
    };
    
    $scope.horarios = {
      hour_ini : '',
      hour_end : ''
    };

    var getDaysSelected = function(days){
      var daysData = [];
      angular.forEach(days, function(data,key){
        if(data){
          daysData.push({ day : key});
          //daysData.push(key);
        }
      });
      return daysData;
    };

  /*$scope.$watch('turnoSelected',function(data){ //Step 1
      console.log('Haber '+angular.toJson(data, true));      
  });
  */

  $scope.addTurno = function(){

    var cantidadSel=$scope.turnos.turnoSelected.length;
    if(cantidadSel>0){
      if($scope.horarios.hour_ini!="" && $scope.horarios.hour_end!=""){

        var days = getDaysSelected($scope.turnos.turnoSelected);
        $scope.turnoSelected = days;
        $scope.turnos.hours_ini = $filter('date')($scope.horarios.hour_ini,'HH:mm:ss');
        $scope.turnos.hours_end = $filter('date')($scope.horarios.hour_end,'HH:mm:ss');
        //$scope.actividadSelected=$scope.turnos.actividadSelected;

        var opciones={
          //actividad:$scope.actividadSelected,
          dias:$scope.turnoSelected,
          hinicio:$scope.turnos.hours_ini,
          hfinal:$scope.turnos.hours_end,
        };
        
        //$scope.listTurnos.push(opciones);
        TurnosPromotionFactory.setTurnosItems(opciones);
        $scope.existeTurno=true;
        //$scope.listTurnos=TurnosPromotionFactory.getTurnosItems();

        cleanTurno();
        //console.log($scope.listTurnos);
        //console.log('Turnos: '+angular.toJson($scope.listTurnos, true));
      }else{
        messageAlert("Turnos","Debe seleccionar campos de hora","warning");
      }
    }else{
      messageAlert("Turnos","Debe seleccionar al menos un dia de la semana","warning");
    }

  };
  $scope.deleteTurno = function (item) {
    $scope.turnoIndex=item;
    //$scope.listTurnos.splice($scope.turnoIndex,1);
    TurnosPromotionFactory.delTurnosItem($scope.turnoIndex);
    cleanTurno();
  };

  var cleanTurno=function(){
    $scope.horarios.hour_ini='';
    $scope.horarios.hour_end='';
    $scope.turnos.turnoSelected=[];
  }

  /*
  $scope.ok = function () {
    $modalInstance.close();
  };*/
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

})

.controller('ZoneInstanceCtrl', function($rootScope,$scope,$uibModal,$modalInstance,$filter,content) {

  $rootScope.itemTables = []; //Usar Servicio
  $scope.listZones = content;
  //console.log($scope.listZones);
  

  /***************Funcion ejecutada por directiva****************/
  
  $scope.activarTableOptions = function(index,data){

    var numero=$scope.itemTables.length;

    if(numero>0){
      var index = $rootScope.itemTables.indexOf(data);
      if (index > -1) {
        $rootScope.itemTables.splice(index, 1);
      }else{
        $rootScope.itemTables.push(data);
      }
    }else{
      $rootScope.itemTables.push(data);
    }
    //console.log('Seleccionados: '+angular.toJson($scope.itemTables, true));

  };
  
  $scope.addPrecio = function () {
    if($rootScope.itemTables.length>0){
      modalInstancesPrices();
    }else{
      messageAlert("Añadir precio","Debe seleccionar al menos una mesa","warning");
    }
  };

  function modalInstancesPrices() {
    var modalInstance = $uibModal.open({
      templateUrl: 'myModalContentPrice.html',
      controller: 'PriceInstanceCtrl',
      size: 'sm',
      resolve: {
        content: function () {
          return $scope.itemTables;
        }
      }
    });
  } 

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

  $scope.desactivarTable = function (index,data) {
    modalInstancesdesactivaPrices(data);
  }
  function modalInstancesdesactivaPrices(data) {
    var modalInstance = $uibModal.open({
      templateUrl: 'myModalContentdesactivaPrice.html',
      controller: 'DesactivaPriceInstanceCtrl',
      size: 'sm',
      resolve: {
        content: function () {
          return data;
        }
      }
    });
  }
  

})

.controller('PriceInstanceCtrl', function($rootScope,$scope,$modalInstance,$filter,content) {
  $scope.itemTables = content;
  $scope.precioDefault = "";

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
  $scope.savePrecio = function () {
    if($scope.precioDefault==""){
      messageAlert("Añadir precio","Debe ingresar precio para mesas selecionadas","warning");
    }else{
      angular.forEach($scope.itemTables, function(objeto) {
        objeto.price=$scope.precioDefault;          
      });
      $rootScope.itemTables=[];
      $modalInstance.close();
      //console.log('Seleccionados '+ angular.toJson($scope.itemTables, true));
    }
  };
  $scope.deleteTable = function (item,index) {
    //$scope.itemTables.splice(index, 1);
    //$rootScope.itemTables.splice(index, 1);
    var idelemento='#el'+$scope.itemTables[index].table_id;
    angular.element(idelemento).removeClass('selected-table');
    $scope.itemTables.splice(index, 1);
    console.log(idelemento);
  };
  //comentario
  

})

.controller('DesactivaPriceInstanceCtrl', function($scope,$modalInstance,$filter,content) {
  $scope.itemPrices = content;
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
  $scope.cleanPrecio = function () {
    var indexforma=$scope.itemPrices.price="";
    $modalInstance.close();
    $scope.itemPrices=[];
  };

});


