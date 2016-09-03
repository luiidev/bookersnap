
angular.module('promotion.controller', ['ngFileUpload','ngImgCrop','textAngular','ngEmoticons'])
.controller('PromotionCtrl', function($scope) {
  $scope.titulo="Promociones";
})

.controller('PromotionAddCtrl', function($scope,$rootScope,$state,$stateParams,Upload,$timeout,$uibModal,PromotionFactory,PromotionDataFactory,TurnosPromotionDataFactory,TableFactory,ZonesActiveFactory,AppBookersnap,UrlRepository,TurnosPromotionDataFactory) {

  var promotionId = $stateParams.id;
  $scope.promotion={};

  PromotionFactory.listSchedules();

  var getTypes = function(){
    PromotionFactory.listTypes().then(function success(data){
      $scope.promotion.tipos = data;
      if(!promotionId){
        $scope.promotion.tipoSelected=$scope.promotion.tipos[0];
      }
    },function error(data){
      messageErrorApi(data,"Error","warning");
    });
  };

  var getZones = function(){
    PromotionFactory.listZones().then(function success(data){
      $scope.promotion.zonas = data;
    },function error(data){
      messageErrorApi(data,"Error","warning");
    });
  };

  var listTablesPayment = function(){
    PromotionFactory.listTablesPayment(promotionId).then(function success(data){
      $scope.promotion.zonas = data;
    },function error(data){
      messageErrorApi(data,"Error","warning");
    });
  };

    //Recortar imagen
  //$scope.myImage = undefined;
  $scope.croppedDataUrl='';   
  $scope.imageCropStep = 1;
  $scope.cropped={cropWidth:100,cropHeight:100,cropTop:0,cropLeft:10}
  //$scope.addCroppingWatcher=function(){ console.log('hecho');}

  if(promotionId){
      $scope.titulo="Actualizar promoción";
      PromotionFactory.onlyPromotion(promotionId).then(function success(data){
        $scope.promotion=data;
        //$scope.zoneSelected.timesDefault = TurnosPromotionDataFactory.generatedTimeTable(data.turn);
        //console.log(data.turn);
        getTypes();
        //
        $scope.promotion.zonas=PromotionFactory.listZonesEdit(promotionId);

        //$scope.urlimagen=UrlRepository+'/promotions/'+$scope.promotion.imagen;
        $scope.promotion.myImage=data.myImage;
        //console.log($scope.promotion.myImage);
        $scope.croppedDataUrl=''; 

        var handleFileSelect=function(evt) {
          var file=evt.currentTarget.files[0];
          var reader = new FileReader();
          reader.onload = function (evt) {
            $scope.$apply(function($scope){
              $scope.promotion.myImage=evt.target.result;
            });
          };
          reader.readAsDataURL(file);
        };
        angular.element(document.querySelector('#fileInput')).on('change',handleFileSelect);


      },function error(data){
        messageErrorApi(data,"Error","warning");
      });
     
  }else{
      $scope.titulo="Nueva promoción";
      $scope.promotion={
        title:"",
        description : "",
        status_expire : false,
        date_expire : "",
        publication:false,
        status:[{name:'Vigente',value:1},{name:'Deshabilitado',value:2}],
        statusSelected:{value:1},
        myImage: ""
        //myImage:'notifications.png'
      };
      getTypes();
      getZones();
  } 


  $scope.validarImg=function(file){
    if(file==null){ 
      messageAlert("Flyer","Seleccione imagen mayor a 300px x 300px","warning");
      delete $scope.promotion.myImage;
      return;
    }
    Upload.upload({
        url: AppBookersnap+'/promotion/uploadFile',
          data: {file: file}
        }).then(function (resp) {
          $scope.imagetmp=resp.data
        },function (resp) {
          messageAlert("Imagen","Se ha producido error interno al subir imagen","warning");
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

    $scope.lstTurn=TurnosPromotionDataFactory.getTurnosItems();
    $scope.lstZone=ZonesActiveFactory.getZonesItems();
    //console.log('LSTzONAS '+angular.toJson($scope.lstZone, true));

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
      if($scope.imagetmp){
        basename=$scope.imagetmp.basename;
        fullname=$scope.imagetmp.fullname;
        cropper=$scope.cropper;
        //cropped=$scope.cropped;
      }else{
        basename=$scope.promotion.imagenOriginal;
        fullname='';
        cropper=$scope.cropper;
      }
      
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
      "title":$scope.promotion.title,
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

    var datosPromotionEditar={
      //"microsite_id":1,
      //"event_id":1,
      //"token":"abc123456",
      "title":$scope.promotion.title,
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
    };

    
    if (option == "create") {
     
      PromotionDataFactory.createPromotion(datosPromotion).success(function(response){
        messageAlert("Success","Se ha creado la promoción con éxito","success");
        console.log('Guardando'+angular.toJson(datosPromotion,true));
      }).error(function(data,status,headers){
        messageErrorApi(data,"Error","warning");
      });
      //console.log('Guardando '+angular.toJson(datosPromotion,true));
      
    }else{
      datosPromotionEditar.event_id = parseInt($stateParams.id);
      
      PromotionDataFactory.updatePromotion(datosPromotionEditar).success(function(response){
        messageAlert("Success","Se actualizado la promoción con éxito","success");
        //$state.go('zone.active');
      }).error(function(data,status,headers){
        messageErrorApi(status,"Error","warning");
      });
      
      console.log('Actualizando '+angular.toJson(datosPromotion,true));
    }
    
  }

  
  
  $scope.modalContent=TurnosPromotionDataFactory.getTurnosItems();
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
  $scope.openModal = function (size) {
    modalInstances(true, size, true, true)
  }
/*
  //Custom Sizes
  

	//Opciones de calendario
	$scope.today = function() {
    $scope.dt = new Date();
  };
  $scope.today();
*/
  $scope.open = function($event, opened) {
   $event.preventDefault();
   $event.stopPropagation();
   $scope[opened] = true;
 };
 $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
 $scope.format = $scope.formats[0];

  $scope.clearImagePromotion = function() {
    delete $scope.promotion.myImage;
    delete $scope.croppedDataUrl;
  };



  /********************************************/
  $scope.invocarZonas=function(item){
    openModalZones(item);
  }
  var openModalZones = function (item) {
    modalInstancesZones(item)
  }
  function modalInstancesZones(item) {
    var modalInstance = $uibModal.open({
      templateUrl: 'myModalContentZone.html',
      controller: 'ZoneInstanceCtrl',
      size: 'lg',
      resolve: {
        content: function () {
          return $scope.promotion.zonas;
        },
        type_event: function () {
          return item;
        }
      }
    });
  }

})

.controller('TurnoInstanceCtrl', function($scope,$stateParams,$modalInstance,$filter,TurnosPromotionDataFactory,content,PromotionFactory) {


  $scope.listTurnos = content;
    //console.log('Hay '+ angular.toJson(content, true));
    //$scope.listTurnos=TurnosPromotionDataFactory.getTurnosItems();

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
/*
//Usados para habilitar/deshabilitar checkbox//
  var disabledDaysSelected = function(days){
      angular.forEach(days, function(data,key){
        if(data){
          var id=data.day;
          $scope.turnos.semana[id].disabled=true;
        }
      });
  };

  var enabledDaysSelected = function(days){
      angular.forEach(days, function(data,key){
        if(data){
          var id=data.day;
          $scope.turnos.semana[id].disabled=false;
        }
      });
  };
*/
    
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
    };
    if($scope.listTurnos!=''){
      $scope.turnos.disposicionSelected={id:2,name:'Añadir turno a la promocion'};
    }else{
      $scope.turnos.disposicionSelected={id:1, name:'Aplicar siempre'};
    }

    var getHorarios = function(){
      PromotionFactory.listSchedules().then(function success(data){
        $scope.turnos.hours_ini = data;
        //var ultimo = $scope.turnos.hours_ini.pop();
        $scope.turnos.hours_end = data;
        //var primero = $scope.turnos.hours_end.shift();
        //$scope.turnos.hour_ini = $scope.turnos.hours_ini[0];
        //$scope.turnos.hour_end = $scope.turnos.hours_ini[1];
      },function error(data){
        messageErrorApi(data,"Error","warning");
      });
    };
  getHorarios();
    
    $scope.horarios = {
      hour_ini : '',
      hour_end : ''
    };

    var promotionId = $stateParams.id;
    if(promotionId){
      //var days = [];
      angular.forEach($scope.listTurnos, function(turn){
        if(turn){
          var days=turn.days;
          //console.log(days);
          //disabledDaysSelected(days);
          //days.push(day);
          //var coleccion=turn.days;
          //daysData.push(key);
        }
        //return days;
      });
      //disabledDaysSelected(days);
      //console.log(days);
    }

    

  /*$scope.$watch('turnoSelected',function(data){ //Step 1
      console.log('Haber '+angular.toJson(data, true));      
  });
  */

  $scope.addTurno = function(){

    var cantidadSel=$scope.turnos.turnoSelected.length;
    if(cantidadSel>0){
      if($scope.turnos.hour_ini && $scope.turnos.hour_end){
        if($scope.turnos.hour_ini.time != $scope.turnos.hour_end.time){        
        var days = getDaysSelected($scope.turnos.turnoSelected);
        $scope.turnoSelected = days;
        //disabledDaysSelected(days);

        $scope.turnos.hours_ini = $filter('date')($scope.turnos.hour_ini.time,'HH:mm:ss');
        $scope.turnos.hours_end = $filter('date')($scope.turnos.hour_end.time,'HH:mm:ss');
        //$scope.actividadSelected=$scope.turnos.actividadSelected;

        var opciones={
          //actividad:$scope.actividadSelected,
          days:$scope.turnoSelected,
          hours_ini:$scope.turnos.hours_ini,
          hours_end:$scope.turnos.hours_end,
        };
        var promotionId = $stateParams.id;
        if(promotionId){
          console.log('Guardar para promocion '+promotionId+' los datos: '+angular.toJson(opciones, true));
        }
        TurnosPromotionDataFactory.setTurnosItems(opciones);
        $scope.existeTurno=true;
        //$scope.listTurnos=TurnosPromotionDataFactory.getTurnosItems();

        cleanTurno();
        //console.log($scope.listTurnos);
        //console.log('Turnos: '+angular.toJson($scope.listTurnos, true));
        }else{
          messageAlert("Turnos","Hora de inicio coincide con Hora final","warning");
        }
      }else{
        messageAlert("Turnos","Debe seleccionar campos de hora","warning");
      }
    }else{
      messageAlert("Turnos","Debe seleccionar al menos un dia de la semana","warning");
    }

  };
  $scope.deleteTurno = function (item,turn) {
    var promotionId = $stateParams.id;
    $scope.turnoIndex=item;
    //enabledDaysSelected(turn.days);
    console.log(angular.toJson('Pasar promocion '+promotionId+' y turno ha eliminar '+turn.turn_id,true));
    //$scope.listTurnos.splice($scope.turnoIndex,1);
    TurnosPromotionDataFactory.delTurnosItem($scope.turnoIndex);
    cleanTurno();
  };

  var cleanTurno=function(){
    getHorarios();
    $scope.turnos.hour_ini='';
    $scope.turnos.hour_end='';
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

.controller('ZoneInstanceCtrl', function($rootScope,$scope,$uibModal,$modalInstance,$filter,content,type_event) {

  $scope.listZones = content;//Todas las zonas en blanco
  $rootScope.itemTables = []; //Array para cuadros moraditos 
  $scope.type_event=type_event;
  //console.log($scope.type_event);
  

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
      modalInstancesPrices($scope.type_event);
    }else{
      messageAlert("Añadir precio","Debe seleccionar al menos una mesa","warning");
    }
  };
  function modalInstancesPrices(type_event) {
    var modalInstance = $uibModal.open({
      templateUrl: 'myModalContentPrice.html',
      controller: 'PriceInstanceCtrl',
      size: 'sm',
      resolve: {
        content: function () {
          return $rootScope.itemTables;
        },
        type_event: function () {
          return type_event;
        },
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

.controller('PriceInstanceCtrl', function($rootScope,$stateParams,$scope,$modalInstance,$filter,content,type_event,ZonesActiveFactory,PromotionDataFactory) {
  
  $scope.itemTables = content;
  $scope.precioDefault = "";
  var promotionId = $stateParams.id;

  //console.log($scope.itemTables);
  //console.log(type_event);
  //console.log(promotionId);
  
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
  $scope.savePrecio = function () {
    if($scope.precioDefault==""){
      messageAlert("Añadir precio","Debe ingresar precio para mesas selecionadas","warning");
    }else{
      var vTable={
        event_id:parseInt(promotionId),
        type_event:parseInt(type_event),
        tables_pay:[]
      }
      angular.forEach($scope.itemTables, function(table) {
        vTable.tables_pay.push({table_id:table.table_id, price:$scope.precioDefault, zone_id:table.zone_id});
      });
      PromotionDataFactory.createTablesPayment(vTable);
      console.log('Guardar: '+angular.toJson(vTable,true));

      angular.forEach($scope.itemTables, function(objeto) {
        objeto.price=$scope.precioDefault;
        ZonesActiveFactory.setZonesItems(objeto);          
      });
      $rootScope.itemTables=[];
      $modalInstance.close();
    }
  };
  $scope.deleteTable = function (item,index) {
    var idelemento='#el'+$scope.itemTables[index].table_id;
    angular.element(idelemento).removeClass('selected-table');
    $scope.itemTables.splice(index, 1);
  }; 

})

.controller('DesactivaPriceInstanceCtrl', function($rootScope,$scope,$stateParams,$modalInstance,$filter,content,ZonesActiveFactory,PromotionDataFactory) {
  
  var promotionId = $stateParams.id;
  $scope.itemPrices = content;
  //console.log($scope.itemPrices);
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
  $scope.cleanPrecio = function () {
    var indexforma=$scope.itemPrices.price="";
    PromotionDataFactory.deleteTablesPayment(promotionId,$scope.itemPrices.table_id);
    ZonesActiveFactory.delZonesItem($scope.itemPrices);
    $modalInstance.close();
    $scope.itemPrices=[];
  };

});


