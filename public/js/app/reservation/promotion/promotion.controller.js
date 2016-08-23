angular.module('promotion.controller', ['ngFileUpload','ngImgCrop','textAngular','ngEmoticons'])

.controller('PromotionCtrl', function($scope) {
  $scope.titulo="Promociones";
})

.controller('PromotionAddCtrl', function($scope,$rootScope,$state,$stateParams,Upload,$timeout,$uibModal,PromotionFactory,TurnosPromotionFactory,TableFactory,ZonesPromotionFactory,ApiUrlReservation) {

  var promotionId = $stateParams.id;
  $scope.promotion={};

  if(promotionId){
    $scope.titulo="Actualizar promoción";
    PromotionFactory.getPromotion(promotionId).success(function(data){
      var promotion=data.data;
      var vPromotion = [];
      var dataPromotion = {
        titulo:promotion.titulo,
        description:promotion.description,
        status_expire:TableFactory.getEvalua(promotion.status_expire),
        date_expire:promotion.date_expire,
        publication:TableFactory.getEvalua(promotion.publication),
        tipoSelected:{type_event_id : promotion.type_event},
        status:[{name:'Vigente',value:1},{name:'Deshabilitado',value:2}],
        statusSelected:{value : promotion.status},
        myImage:promotion.imagen,
        turn: promotion.turn,
        zonas: promotion.zone
      }
      vPromotion.push(dataPromotion);
      getTypes();
      $scope.promotion=vPromotion[0];

      /*var zones=promotion.zone
      angular.forEach(zones, function(zone,key) {
        //console.log('key: '+key+' zona: '+zone.table_id)
        //TurnosPromotionFactory.setTurnosItems(turn);
      });
      */
      var turnos=promotion.turn
      angular.forEach(turnos, function(turn) {
        TurnosPromotionFactory.setTurnosItems(turn);
      });
      //console.log(angular.toJson($scope.promotion, true));
      console.log(angular.toJson(data, true));
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


    var getZones = function(){
    PromotionFactory.getZones().success(function(data){
      var vZones = [];
      angular.forEach(data['data'], function(zones) {
        var tables = zones.table;
        var vTables = [];
        angular.forEach(tables, function(table) {
          var position = table.config_position.split(",");
          var dataTable = {
            zone_id : zones.zone_id,
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
      //console.log(angular.toJson(vZones,true));
    });
    };
    getZones();
  }

  

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
  

  $scope.cropped={cropWidth:100,cropHeight:100,cropTop:0,cropLeft:10}
  //$scope.addCroppingWatcher=function(){ console.log('hecho');}

  $scope.validarImg=function(file){
    if(file==null){ 
      messageAlert("Flyer","Seleccione imagen mayor a 300px x 300px","warning");
      delete $scope.promotion.myImage;
      return;
    }
    Upload.upload({
        url: ApiUrlReservation+'/promotion/uploadFile',
          data: {file: file}
        }).then(function (resp) {
          $scope.imagetmp=resp.data
          //console.log('Json: '+angular.toJson(resp.data,true));
        },function (resp) {
          console.log('Error status: ' + resp.status);
    });
  }
  
  var existsZone=function(zones,idZone){
    var index=null;
    angular.forEach(zones, function(zone,key){
      if(zone.zone_id==idZone){
        index=key;
      }
    });
    return index;
  }

  $scope.savePromotion=function(option){

    //uploadImage($scope.promotion.myImage);
    //uploadImage64($scope.croppedDataUrl);

    $scope.lstTurn=TurnosPromotionFactory.getTurnosItems();
    $scope.lstZone=ZonesPromotionFactory.getZonesItems();

    var date_expire ='';
    if($scope.promotion.status_expire==true){
      date_expire=convertFechaYYMMDD($scope.promotion.date_expire,"es-ES",{});
    }else{
      date_expire='';
    }

    var zones;
    var vZones = [];
    var condi_zone=$scope.promotion.tipoSelected.type_event_id;
    if(condi_zone==3){
      zones=[];
    }else{
      zones=$scope.lstZone;
      angular.forEach(zones, function(zone) {
        var indexZone=existsZone(vZones,zone.zone_id);
        if(indexZone==null){
          var dataTable = {
            zone_id:zone.zone_id,
            name:zone.name,
            table:[{table_id : zone.table_id, price : zone.price}]
          }
          vZones.push(dataTable);
        }else{
          vZones[indexZone].table.push({table_id : zone.table_id, price : zone.price});
        }
        
      });
      //console.log('Zonas lst'+angular.toJson(vZones,true));
    }

    var imagen='';
    if($scope.promotion.myImage){
      basename=$scope.imagetmp.basename;
      fullname=$scope.imagetmp.fullname;
      cropper=$scope.cropper;
      cropped=$scope.cropped;
    }else{
      basename='';
      fullname='';
      cropper='';
      //cropped='';
    }
    //console.log($scope.promotion.myImage);

    var datosPromotion={
      "microsite_id":1,
      //"event_id":1,
      //"token":"abc123456",
      //"titulo":$scope.promotion.titulo,
      "description":$scope.promotion.description,
      "image":basename,
      "type_event":$scope.promotion.tipoSelected.type_event_id,
      "status":$scope.promotion.statusSelected.value,
      "status_expire":TableFactory.getEvaluaInverse($scope.promotion.status_expire),
      "date_expire":date_expire,
      //"publication":$scope.promotion.publication,
      //"tipo":$scope.promotion.tipoSelected.value,      
      "image_fullname":fullname,
      "cropper":cropper,
      //"cropped":cropped,
      "turn": $scope.lstTurn,
      "zone":vZones
    };

    
    if (option == "create") {
     
      PromotionFactory.createPromotion(datosPromotion).success(function(response){
        messageAlert("Success","Se ha creado promoción con éxito","success");
        console.log('Guardando'+angular.toJson(datosPromotion,true));
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
    
    
    //console.log(TurnosPromotionFactory.getTurnosItems());
  }

  
  
  $scope.modalContent=TurnosPromotionFactory.getTurnosItems();
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
          days:$scope.turnoSelected,
          hours_ini:$scope.turnos.hours_ini,
          hours_end:$scope.turnos.hours_end,
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

  $scope.listZones = content;//Todas las zonas en blanco
  $rootScope.itemTables = []; //Array para cuadros moraditos  
  //console.log($scope.listZones);
  

  /***************Funcion ejecutada por directiva****************/
  
  $scope.activarTableOptions = function(index,data){

    var numero=$rootScope.itemTables.length;

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
          return $rootScope.itemTables;
        }
      }
    });
  } 
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };


  $scope.desactivarTable = function (index,data) {
    modalInstancesdesactivaPrices(index,data);
  }
  function modalInstancesdesactivaPrices(index,data) {
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

.controller('PriceInstanceCtrl', function($rootScope,$scope,$modalInstance,$filter,content,ZonesPromotionFactory) {
  
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
        ZonesPromotionFactory.setZonesItems(objeto);          
      });
      $rootScope.itemTables=[];
      $modalInstance.close();
      //var almacen=ZonesPromotionFactory.getZonesItems();
      //console.log('Almacen '+ angular.toJson(almacen, true));
    }
  };
  $scope.deleteTable = function (item,index) {
    var idelemento='#el'+$scope.itemTables[index].table_id;
    angular.element(idelemento).removeClass('selected-table');
    $scope.itemTables.splice(index, 1);
  }; 

})

.controller('DesactivaPriceInstanceCtrl', function($scope,$rootScope,$modalInstance,$filter,content,ZonesPromotionFactory) {
  $scope.itemPrices = content;
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
  $scope.cleanPrecio = function () {
    var indexforma=$scope.itemPrices.price="";
    ZonesPromotionFactory.delZonesItem($scope.itemPrices);
    $modalInstance.close();
    $scope.itemPrices=[];
    //var almacen=ZonesPromotionFactory.getZonesItems();
    //console.log('Almacen2 '+ angular.toJson(almacen, true));
  };

});


