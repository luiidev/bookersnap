angular.module('promotionList.controller', ['ui.sortable','sortable'])
.controller('PromotionListCtrl', function($rootScope, $scope, $http, $window, $document) {
      
      // VARIABLES DE PAGINADO
      $scope.page = 0;
      $scope.fetching = true;
      $scope.limit = 3;
      $scope.page = 1;

      // VARIABLES DE FILTRO
      $rootScope.filtro = {
        fecha_inicio: "",
        fecha_fin: "",
        texto: ""
      }

      $scope.reloadRoute = function() {
          $window.location.reload();
      }

      $scope.filtrar = function(){
        
            $rootScope.flag = true;
            $scope.promociones = [];
            $scope.page = 1;
            
        if($rootScope.filtro.fecha_inicio==undefined){
          $rootScope.filtro.fecha_inicio ="";
        }

        if($rootScope.filtro.fecha_fin==undefined){
          $rootScope.filtro.fecha_fin ="";
        }

            $http.get(
              'http://192.168.0.107/api.promociones/public/v1/es/microsites/1/promotions?page='+$scope.page+'&limit='
              +$scope.limit+'&filter[fecha_inicial]='+$scope.obtenerFecha($rootScope.filtro.fecha_inicio)+'&filter[fecha_final]='+$scope.obtenerFecha($rootScope.filtro.fecha_fin)+'&filter[name]='+$rootScope.filtro.texto)
            .then(function(items) {
                $scope.fetching = items.data.success;
                for (var i = 0; i< items.data.data.length; i++) {
                  $scope.promociones.push(items.data.data[i]);
                }
            });

      };  
      
      // Antepone zeros
      $scope.addZero = function(numero){
        return ("0" + numero).slice (-2);
      }

      $scope.obtenerFecha = function(fecha){
        console.log(fecha);
        if(fecha=="aN-aN-aN"){
          fecha ="";
        }
        if(fecha!=""){
              var datefechainicio = new Date(fecha);
              return $scope.addZero(datefechainicio.getDate())  + "-" + $scope.addZero(datefechainicio.getMonth() + 1) + "-" + datefechainicio.getFullYear();
        }else{
          return "";
        }
      }


      // PAGINADO MEDIANTE SCROLL
      $scope.scroll =  function(){
                
                angular.element($window).bind("scroll", function() {
                            
                           if(this.window.innerHeight + this.window.window.scrollY >= $document[0].body.offsetHeight){
                              $scope.page++;
                              if($scope.fetching==true){   
                                //$http.get('http://192.168.0.107/api.promociones/public/v1/es/microsites/1/promotions?page='+$scope.page+'&limit='+$scope.limit).then(function(items) {
                                $http.get('http://192.168.0.107/api.promociones/public/v1/es/microsites/1/promotions?page='+$scope.page+'&limit='
                                +$scope.limit+'&filter[fecha_inicial]='+$scope.obtenerFecha($rootScope.filtro.fecha_inicio)+'&filter[fecha_final]='+$scope.obtenerFecha($rootScope.filtro.fecha_fin)+'&filter[name]='+$rootScope.filtro.texto)
                                .then(function(items) {
                                $scope.fetching = items.data.success;
                                 // Append the items to the list
                                 for (var i = 0; i< items.data.data.length; i++) {
                                    $scope.promociones.push(items.data.data[i]);
                                 }
                                });
                                  //console.log("Mi paginado");
                              }
                           }
                });
                      
      }


   $scope.$watch("promociones", function (newVal, oldVal) {

 
   }, true);
      

   /* SE HACE EL LLAMADO DE LAS PROMOCIONES */
   $scope.init = function () {

        $scope.promociones = [];
        $scope.page = 1; 
        $rootScope.flag = false;
        $scope.fetching = true;
        $rootScope.filtro.texto = "";

        $http.get("http://192.168.0.107/api.promociones/public/v1/es/microsites/1/promotions?page="+$scope.page+"&limit="+$scope.limit)
            .success(function (response) {
              if(response.success==true){
                $scope.promociones = response.data;
                $scope.items = response.data;
              }
            })
            .error(function () {

            });
      
        $scope.show = "All";
        $scope.currentShow = 0; 
        $scope.scroll();
    };
  
    /* FUNCION PARA ELIMINAR LA PROMOCION */ 
    $scope.deleteTodo = function (item) {

      var r = confirm("¿Desea eliminar la promoción?");
      if (r == true) {
         $http({
            method: 'DELETE',
            params: {token:"sdsdf5sdf56sd6f5"},
            url: 'http://192.168.0.107/api.promociones/public/v1/es/microsites/1/promotions/'+item.id,
        }) 
        .success(function (response) {
              
              if(response["success"] == true){

                  var index = $scope.promociones.indexOf(item);
                  $scope.promociones.splice(index, 1);     

              }else if(response["success"] == false){
                  
                  messageAlert("Error", response["msg"],"warning");

              }
              
        })
        .error(function (data) {
              alert(data.jsonError);
        });
      } 
    };

    $scope.todoSortable = {
        containment: "parent", //Dont let the user drag outside the parent
        cursor: "move", //Change the cursor icon on drag
        tolerance: "pointer"//Read http://api.jqueryui.com/sortable/#option-tolerance
    };

    var items = [];

    /* ORDENADO DE PROMOCIONES MEDIANTE DRAG AND DROP */

     $scope.$watch("promociones", function (newVal, oldVal) {
      
        if(newVal !== null && newVal.length !=0 && oldVal.length != 0){
          
          if(newVal != oldVal && oldVal!=null){

            /* Estado para poder inhabilitar el ordenamiento mediante drag and drop cuando 
               se hace una busqueda ó filtro */
            if($rootScope.flag==false){


            /* Se genera la estructura del array a enviar al webservices */
            var newurl = "";  
            for (i = 0; i < newVal.length; i++) {

                var myData = new Array("items["+i+"][promotion_id]="+newVal[i].id+"", "items["+i+"][item]="+newVal[i].item+"");
                var url = myData.join('&');
                if(i==0){
                  newurl = newurl.concat(url); 
                }else{
                  newurl = newurl.concat("&"+url);
                }

            }


              
              $http({
                 method: 'PATCH',
                    url: 'http://192.168.0.107/api.promociones/public/v1/es/microsites/1/promotions/order?'+newurl,
              }) 
              .then(function successCallback(response) {
                if(response["success"]==false){
                   messageAlert("Error", response["msg"],"warning");
                }
              }, function errorCallback(response) {
                  console.log(response.statusText)
              });

             }

            }
          }

     }, true);

     /* CAMBIAR ESTADO DE LA PROMOCION*/
     $scope.estadoPromocion = function(index){
      
          var status = 0;
          var id = $scope.promociones[index].id;
              
          if($scope.promociones[index].status == true){
              status = 1;
          }else if ($scope.promociones[index].status == false){
              status = 0;
          }

          $http({
              method: 'PATCH',
              url: 'http://192.168.0.107/api.promociones/public/v1/es/microsites/1/promotions/'+id+'?status='+status,
          }) 
          .then(function successCallback(response) {
              
          }, function errorCallback(response) {
                    
          });   
        
     }

    /* METODOS PARA CAMBIAR LA POSICION DE LA PROMOCION */ 
    var move = function (origin, destination){
      
        var temp = $scope.promociones[destination];
        $scope.promociones[destination] = $scope.promociones[origin];
        $scope.promociones[origin] = temp;
    };
 
    $scope.moveUp = function(index){            
        move(index, index - 1);
    };
 
    $scope.moveDown = function(index){                    
        move(index, index + 1);
    };

    $scope.init();

}).factory('notify', ['$window', function(win) {
   /*
   var msgs = [];
   return function(msg) {
     msgs.push(msg);
     if (msgs.length === 3) {
       win.alert(msgs.join('\n'));
       msgs = [];
     }
   };*/
 }]);

