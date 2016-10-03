angular.module('promotionList.controller', ['ui.sortable', 'sortable'])
    .controller('PromotionListCtrl', function(Promotion, $rootScope, $scope, $http, $window, $document, ApiUrlReservation) {

        var sm = this;
        sm.promociones = [];
        sm.flag = false;

        // VARIABLES DE FILTRO
        sm.filtro = {
            fecha_inicio: "",
            fecha_fin: "",
            texto: ""
        };

        sm.reloadRoute = function() {
            $window.location.reload();
        };

        sm.obtenerFecha = function(fecha) {

            if (fecha == "aN-aN-aN") {
                fecha = "";
            }
            if (fecha !== "") {
                var datefechainicio = new Date(fecha);
                return sm.addZero(datefechainicio.getDate()) + "-" + sm.addZero(datefechainicio.getMonth() + 1) + "-" + datefechainicio.getFullYear();
            } else {
                return "";
            }
        };


        sm.filtrar = function() {

            sm.promociones = [];
            sm.flag = true;

            if (sm.filtro.fecha_inicio === undefined) {
                sm.filtro.fecha_inicio = "";
            }

            if (sm.filtro.fecha_fin === undefined) {
                sm.filtro.fecha_fin = "";
            }

            Promotion.filter(sm); // Se actualiza el modelo de promociones 
        };

        // Antepone zeros
        sm.addZero = function(numero) {
            return ("0" + numero).slice(-2);
        };


        /* SE HACE EL LLAMADO DE LAS PROMOCIONES */
        $scope.init = function() {

            sm.promociones = [];
            sm.filtro.texto = "";
            sm.flag = false;
            $http.get(ApiUrlReservation + "/promotions")
                .success(function(response) {
                    sm.promociones = response.data;
                    $scope.items = response.data;
                })
                .error(function() {

                });
            $scope.show = "All";
            $scope.currentShow = 0;
        };

        /* FUNCION PARA ELIMINAR LA PROMOCION */
        sm.deleteTodo = function(item) {

            var r = confirm("¿Desea eliminar la promoción?");
            if (r === true) {
                $http({
                        method: 'DELETE',
                        params: {
                            token: "sdsdf5sdf56sd6f5"
                        },
                        url: ApiUrlReservation + '/promotions/' + item.id,
                    })
                    .success(function(response) {

                        if (response["success"] === true) {

                            var index = sm.promociones.indexOf(item);
                            sm.promociones.splice(index, 1);

                        } else if (response["success"] === false) {

                            messageAlert("Error", response["msg"], "warning");

                        }

                    })
                    .error(function(data) {
                        alert(data.jsonError);
                    });
            }
        };

        $scope.todoSortable = {
            containment: "parent", //Dont let the user drag outside the parent
            cursor: "move", //Change the cursor icon on drag
            tolerance: "pointer" //Read http://api.jqueryui.com/sortable/#option-tolerance
        };
        var items = [];

        /* ORDENADO DE PROMOCIONES MEDIANTE DRAG AND DROP */

        $scope.$watch("sm.promociones", function(newVal, oldVal) {

            if (newVal !== null && newVal.length !== 0 && oldVal.length !== 0) {

                if (newVal != oldVal && oldVal !== null) {

                    /* Estado para poder inhabilitar el ordenamiento mediante drag and drop cuando 
                       se hace una busqueda ó filtro */
                    if (sm.flag === false) {


                        /* Se genera la estructura del array a enviar al webservices */
                        var newurl = "";
                        for (i = 0; i < newVal.length; i++) {

                            var myData = new Array("items[" + i + "][promotion_id]=" + newVal[i].id + "", "items[" + i + "][item]=" + newVal[i].item + "");
                            var url = myData.join('&');
                            if (i === 0) {
                                newurl = newurl.concat(url);
                            } else {
                                newurl = newurl.concat("&" + url);
                            }

                        }

                        Promotion.order(sm, newurl); // Se ordenan las promociones

                    }

                }
            }

        }, true);

        /* CAMBIAR ESTADO DE LA PROMOCION*/
        sm.estadoPromocion = function(index) {

            var status = 0;
            var id = sm.promociones[index].id;

            if (sm.promociones[index].status === true) {
                status = 1;
            } else if (sm.promociones[index].status === false) {
                status = 0;
            }

            Promotion.changueState(id,status); // SE cambia de estado

        };

        /* METODOS PARA CAMBIAR LA POSICION DE LA PROMOCION */
        var move = function(origin, destination) {

            var temp = sm.promociones[destination];
            sm.promociones[destination] = sm.promociones[origin];
            sm.promociones[origin] = temp;
        };

        sm.moveUp = function(index) {
            move(index, index - 1);
        };

        sm.moveDown = function(index) {
            move(index, index + 1);
        };

        $scope.init();

    }).controller('GestionarCamposCtrl', function($scope, $uibModal) {

        function modalInstances(animation, size, backdrop, keyboard) {

            var modalInstance = $uibModal.open({
                animation: animation,
                templateUrl: 'myModalContent.html',
                controller: 'GestionCamposReservacionesCtrl',
                size: size,
                resolve: {
                    content: function() {
                        return $scope.modalContent;
                    }
                }
            });

        }

        //Custom Sizes
        $scope.openModal = function(size) {
            modalInstances(true, size, true, true);
        };


    }).controller('GestionCamposReservacionesCtrl', function($scope, $http, $uibModalInstance, ApiUrlReservation) {

        $scope.list = [];
        $scope.array = [];
        $http.get(ApiUrlReservation + "/reservations/forms")
            .success(function(response) {
                if (response.success === true) {

                    $scope.list = response.data.inputs_all;

                    for (var i = 0; i < response["data"]["inputs_form_select"].length; i++) {
                        $scope.array.push(response["data"]["inputs_form_select"][i]["form_id"]);

                    }
                }
            });

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

    }).directive("checkboxGroup", function($http, ApiUrlReservation) {
        return {
            restrict: "A",
            link: function(scope, elem, attrs) {

                // Determine initial checked boxes
                if (scope.array.indexOf(scope.item.form_id) !== -1) {
                    elem[0].checked = true;
                }

                // Update array on click
                elem.bind('click', function() {


                    var form_id = scope.item.form_id;

                    // Checked 
                    if (elem[0].checked) {

                        /* Se envian los estados y cambios */
                        $http({
                                method: 'POST',
                                data: {
                                    form_id: form_id
                                },
                                url: ApiUrlReservation + '/reservations/forms',
                            })
                            .then(function successCallback(response) {
                                // console.log(response);  
                            });

                    }
                    // unchecked
                    else {

                        $http({
                                method: 'DELETE',
                                url: ApiUrlReservation + '/reservations/forms/' + form_id,
                            })
                            .then(function successCallback(response) {

                            });

                    }

                });
            }
        };
    });
