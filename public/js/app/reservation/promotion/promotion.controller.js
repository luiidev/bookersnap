angular.module('promotion.controller', ['ngFileUpload','ngImgCrop','textAngular','ngEmoticons','farbtastic','localytics.directives'])
.controller('PromotionCtrl', function($scope) {

  $scope.titulo="Promociones";
	
})
.controller('PromotionAddCtrl', function($scope,Upload,$timeout,$uibModal,PromotionFactory,TurnosPromotionFactory) {

  $scope.titulo="Nueva promoción";
  
  PromotionFactory.getTypes().success(function(data){
    var vTypes = [];
    angular.forEach(data['data'], function(types) {
          vTypes.push(types); 
    });
    $scope.promotion.tipos = vTypes;
    $scope.promotion.tipoSelected=$scope.promotion.tipos[0];
    //console.log(vTypes);
  });

  $scope.promotion={
    estados:[{name:'Activo',value:1},{name:'Inactivo',value:0}],
    estadoSelected:{value:1},
    //tipos:[{name:'Gratis',type_event_id:3},{name:'De pago',type_event_id:4}],
    //tipoSelected:{name:'Gratis',type_event_id:3},
    descripcion:" ",
    zonas:[
      {id:1,title:'Zona01',formas:[
        {id:'1', name:'Zona01', shape:'round', size:'medium', top:'20', left:'20',content:'1-2',precio:''},
        {id:'2', name:'Zona01', shape:'square', size:'medium', top:'20', left:'130',content:'1-2',precio:''},
        {id:'3', name:'Zona01', shape:'round', size:'medium', top:'20', left:'230',content:'1-2',precio:''},
        {id:'4', name:'Zona01', shape:'recta', size:'medium', top:'120', left:'60',content:'3-4',precio:''},
        {id:'5', name:'Zona01', shape:'recta', size:'medium', top:'120', left:'170',content:'3-4',precio:''}
      ]},
      {id:2,title:'Zona02',formas:[{id:'6', name:'Zona02', shape:'round', size:'medium', top:'90', left:'60',content:'1-2',precio:''}]},
      {id:3,title:'Zona03',formas:[{id:'7', name:'Zona03', shape:'recta', size:'medium', top:'150', left:'120',content:'3-4',precio:''}]},
      {id:4,title:'Zona04',formas:[{id:'8', name:'Zona04', shape:'square', size:'medium', top:'110', left:'120',content:'3-4',precio:''}]}
    ],
    zonaSelected:'',
    caduca:false,
    publica:true,
    myImage: undefined,
    precioDefault:'12'
  };

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

  $scope.savePromotion=function(){

    uploadImage($scope.promotion.myImage);
    uploadImage64($scope.croppedDataUrl);

    $scope.datosPromotion={
      "microsite_id":1,
      "event_id":1,
      "token":"abc123456",
      "titulo":$scope.promotion.titulo,
      "description":$scope.promotion.descripcion,
      "status_expire":$scope.promotion.caduca,
      "date_expire":$scope.promotion.fecha_caduca,
      "publica":$scope.promotion.publica,
      "tipo":$scope.promotion.tipoSelected.value,
      "status":$scope.promotion.estadoSelected.value,
      "image":cleanString($scope.promotion.myImage.name)
    };
    console.log('Guardando'+angular.toJson($scope.datosPromotion,true));
    console.log(TurnosPromotionFactory.getTurnosItems());
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
.controller('FlyerAddCtrl', function($scope,Upload,PromotionFactory) {

 	$scope.titulo="Diseñar Flyer";

  $scope.textFlyer=[];
  $scope.textActive=false;
  $scope.textIndex=0;

  PromotionFactory.getLabel().success(function(data){
    var vTexto = [];
    angular.forEach(data['data'], function(label) {
          vTexto.push(label); 
    });
    $scope.flyer.labels = vTexto;
    $scope.flyer.labelSelected=$scope.flyer.labels[0];
  });

  PromotionFactory.getTypographys().success(function(data){
    var vTipography = [];
    angular.forEach(data['data'], function(tipography) {
          vTipography.push(tipography); 
    });
    $scope.flyer.fonts = vTipography;
    $scope.flyer.fontSelected=$scope.flyer.fonts[0];
  });


  $scope.flyer={
    sizes:[{id:10, valor: '10px'},{id:12, valor: '12px'},{id: 14, valor: '14px'}],
    sizeSelected:{id: 14, valor: '14px'},
    colorSelected:{color: '#03A9F4'},
    //states:[{name: 'Activo',value:1},{name: 'Inactivo',value:0}],
    //stateSelected:{value: 1}
  }

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
    //console.log("selectedText "+angular.element('.text-flyer').eq(index).css("top"));
  }

  /*Actualizar datos en el array textFlyer*/
  /*
  $scope.updateText=function(){
    if($scope.flyer.labelSelected.label_id==$scope.textFlyer[$scope.textIndex].label.label_id){
    $scope.textFlyer[$scope.textIndex].label=$scope.flyer.labelSelected;
    $scope.textFlyer[$scope.textIndex].tipografy=$scope.flyer.fontSelected.name;
    $scope.textFlyer[$scope.textIndex].font_size=$scope.flyer.sizeSelected.id+"px";
    $scope.textFlyer[$scope.textIndex].color=$scope.flyer.colorSelected.color;   
    $scope.textActive=false;
    cleanText();
    }else{ 
      messageAlert("Flyer","Modificacion no corresponde a objeto seleccionado","warning");
    }
  }
*/
  $scope.autoPropiedad = function () {
    if($scope.textFlyer.length!=0){
      $scope.textFlyer[$scope.textIndex].font_size=$scope.flyer.sizeSelected.id+"px";
      $scope.textFlyer[$scope.textIndex].color=$scope.flyer.colorSelected.color;
      $scope.textFlyer[$scope.textIndex].typography={typography_id:$scope.flyer.fontSelected.typography_id,name:$scope.flyer.fontSelected.name};
    }
  };
  
  /*Eliminar dato del array textFlyer*/
  $scope.deleteText=function(){
    $scope.textFlyer.splice($scope.textIndex,1);
    $scope.textActive=false;
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
        $scope.temporal=file;
        $scope.existeFlyer=true;
  };
  var uploadFile=function(file){
    Upload.upload({
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
  }
  var uploadFile64=function(file){
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

  $scope.clearImageFlyer = function() {
      delete $scope.coleccion.fileimg;
  };

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

      uploadFile($scope.coleccion.fileimg);
      generateFlyer();
      $scope.principal={
      "microsite_id":1,
      "event_id":1,
      "token":"abc123456",
      //"status":$scope.flyer.stateSelected.value,
      "image":cleanString($scope.coleccion.fileimg.name),
      "label":$scope.textFlyer
      };
      console.log("General  "+angular.toJson($scope.principal,true));
      messageAlert("Flyer","Se ha adjuntado correctamente el flyer","success");

    }else{ 
        messageAlert("Flyer","Debe seleccionar una imagen para el flyer","warning");
    };

    
    
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
      actividadSelected : {id: 1, name: 'Reservacion'},
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
        $scope.actividadSelected=$scope.turnos.actividadSelected;

        var opciones={
          actividad:$scope.actividadSelected,
          dias:$scope.turnoSelected,
          hinicio:$scope.turnos.hours_ini,
          hfinal:$scope.turnos.hours_end,
        };
        
        //$scope.listTurnos.push(opciones);
        TurnosPromotionFactory.setTurnosItems(opciones);
        $scope.existeTurno=true;
        //$scope.listTurnos=TurnosPromotionFactory.getTurnosItems();

        cleanTurno();
        console.log($scope.listTurnos);
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
        objeto.precio=$scope.precioDefault;          
      });
      $rootScope.itemTables=[];
      $modalInstance.close();
      //console.log('Seleccionados '+ angular.toJson($scope.itemTables, true));
    }
  };
  $scope.deleteTable = function (item,index) {
    //$scope.itemTables.splice(index, 1);
    //$rootScope.itemTables.splice(index, 1);
    var idelemento='#el'+$scope.itemTables[index].id;
    angular.element(idelemento).removeClass('selected-table');
    console.log(idelemento);
  };

  

})

.controller('DesactivaPriceInstanceCtrl', function($scope,$modalInstance,$filter,content) {
  $scope.itemPrices = content;
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
  $scope.cleanPrecio = function () {
    var indexforma=$scope.itemPrices.precio="";
    $modalInstance.close();
    $scope.itemPrices=[];
  };

});

