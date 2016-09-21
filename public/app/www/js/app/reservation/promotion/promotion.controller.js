angular.module('promotion.controller', ['ngFileUpload', 'ngImgCrop', 'textAngular', 'ngEmoticons'])
    .controller('PromotionCtrl', function($scope) {
        $scope.titulo = "Promociones";
    })

.controller('PromotionAddCtrl', function($scope, $rootScope, $state, $stateParams, Upload, $timeout, $uibModal, PromotionFactory, PromotionDataFactory, TurnosPromotionDataFactory, TableFactory, ZonesActiveFactory, AppBookersnap, UrlRepository) {

    var promotionId = $stateParams.id;
    $scope.promotion = {};

    var getTypes = function() {
        PromotionFactory.listTypes().then(function success(data) {
            $scope.promotion.tipos = data;
            if (!promotionId) {
                $scope.promotion.tipoSelected = $scope.promotion.tipos[0];
            }
        }, function error(data) {
            messageErrorApi(data, "Error", "warning");
        });
    };

    var getZones = function() {
        PromotionFactory.listZones().then(function success(data) {
            $scope.promotion.zonas = data;
        }, function error(data) {
            messageErrorApi(data, "Error", "warning");
        });
    };

    var listTablesPayment = function() {
        PromotionFactory.listTablesPayment(promotionId).then(function success(data) {
            $scope.promotion.zonas = data;
        }, function error(data) {
            messageErrorApi(data, "Error", "warning");
        });
    };

    /*Parametros iniciales para recorte de imagen*/
    $scope.croppedDataUrl = '';
    $scope.imageCropStep = 1;
    $scope.cropped = { cropWidth: 100, cropHeight: 100, cropTop: 0, cropLeft: 10 };

    if (promotionId) {
        $scope.titulo = "Actualizar promoción";
        PromotionFactory.onlyPromotion(promotionId).then(function success(data) {
            $scope.promotion = data;
            getTypes();
            $scope.promotion.zonas = PromotionFactory.listZonesEdit(promotionId);
            /*Preguntar si existe imagen*/
            if (data.imagenOriginal) {
                $scope.promotion.myImage = data.myImage;
                $scope.croppedDataUrl = '';

                var handleFileSelect = function(evt) {
                    var file = evt.currentTarget.files[0];
                    var reader = new FileReader();
                    reader.onload = function(evt) {
                        $scope.$apply(function($scope) {
                            $scope.promotion.myImage = evt.target.result;
                        });
                    };
                    reader.readAsDataURL(file);
                };
                angular.element(document.querySelector('#fileInput')).on('change', handleFileSelect);
            } else {
                $scope.promotion.myImage = "";
            }


        }, function error(data) {
            messageErrorApi(data, "Error", "warning");
        });

    } else {
        $scope.titulo = "Nueva promoción";
        $scope.promotion = {
            title: "",
            description: "",
            status_expire: false,
            date_expire: "",
            publication: false,
            status: [{ name: 'Vigente', value: 1 }, { name: 'Deshabilitado', value: 2 }],
            statusSelected: { value: 1 },
            myImage: ""
                //myImage:'notifications.png'
        };
        getTypes();
        getZones();

    }

    /*Accion de boton Seleccionar imagen y subida a carpeta temporal*/
    $scope.validarImg = function(file) {
        if (file === null) {
            messageAlert("Flyer", "Seleccione imagen mayor a 300px x 300px", "warning");
            delete $scope.promotion.myImage;
            return;
        }
        Upload.upload({
            url: AppBookersnap + '/promotion/uploadFile',
            data: { file: file }
        }).then(function(resp) {
            $scope.imagetmp = resp.data;
        }, function(resp) {
            messageAlert("Imagen", "Se ha producido error interno al subir imagen", "warning");
            console.log('Error status: ' + resp.status);
        });
    };

    /*Funcion para agrupar table en zones*/
    var existsZone = function(zones, idZone) {
        var index = null;
        angular.forEach(zones, function(zone, key) {
            if (zone.zone_id == idZone) {
                index = key;
            }
        });
        return index;
    };
    //console.log('Fecha '+$scope.promotion.date_expire);
    /*Accion de boton Guardar promocion*/
    $scope.savePromotion = function(option) {

        //uploadImage($scope.promotion.myImage);
        //uploadImage64($scope.croppedDataUrl);

        $scope.lstTurn = TurnosPromotionDataFactory.getTurnosItems();
        $scope.lstZone = ZonesActiveFactory.getZonesItems();

        /*Validaciones y formatos de campos*/
        var date_expire = '';
        if ($scope.promotion.status_expire === true) {
            date_expire = convertFechaYYMMDD($scope.promotion.date_expire, "es-ES", {});
        } else {
            date_expire = '';
        }

        var zones;
        var vZones = [];
        var condi_zone = $scope.promotion.tipoSelected.type_event_id;
        if (condi_zone == 3) {
            zones = [];
        } else {
            zones = $scope.lstZone;
            angular.forEach(zones, function(zone) {
                var indexZone = existsZone(vZones, zone.zone_id);
                if (indexZone === null) {
                    var dataTable = {
                        zone_id: zone.zone_id,
                        name: zone.name,
                        table: [{ table_id: zone.table_id, price: zone.price }]
                    };
                    vZones.push(dataTable);
                } else {
                    vZones[indexZone].table.push({ table_id: zone.table_id, price: zone.price });
                }

            });
        }

        var imagen = '';
        if ($scope.promotion.myImage) {
            if ($scope.imagetmp) {
                basename = $scope.imagetmp.basename;
                fullname = $scope.imagetmp.fullname;
                cropper = $scope.cropper;
                //cropped=$scope.cropped;
            } else {
                basename = $scope.promotion.imagenOriginal;
                fullname = '';
                cropper = $scope.cropper;
            }

        } else {
            basename = '';
            fullname = '';
            cropper = '';
            //cropped='';
        }

        /*Formatear objetos a enviar al guardar y/o actualizar*/
        var datosPromotion = {
            //"microsite_id":1,
            "title": $scope.promotion.title,
            "description": $scope.promotion.description,
            "image": basename,
            "type_event": $scope.promotion.tipoSelected.type_event_id,
            "status": $scope.promotion.statusSelected.value,
            "status_expire": TableFactory.getEvaluaInverse($scope.promotion.status_expire),
            "date_expire": date_expire,
            //"publication":$scope.promotion.publication,   
            "image_fullname": fullname,
            "cropper": cropper,
            //"cropped":cropped,
            "turn": $scope.lstTurn,
            "zone": vZones
        };

        var datosPromotionEditar = {
            "title": $scope.promotion.title,
            "description": $scope.promotion.description,
            "image": basename,
            "type_event": $scope.promotion.tipoSelected.type_event_id,
            "status": $scope.promotion.statusSelected.value,
            "status_expire": TableFactory.getEvaluaInverse($scope.promotion.status_expire),
            "date_expire": date_expire,
            //"publication":$scope.promotion.publication,   
            "image_fullname": fullname,
            "cropper": cropper,
        };

        if ($scope.promotion.description !== '') {

            if (option == "create") {

                PromotionDataFactory.createPromotion(datosPromotion).success(function(response) {
                    if (response.success) {
                        messageAlert("Success", "Se ha creado la promoción con éxito", "success");
                        var redireccionar = function() {
                            $state.go('promotion-list');
                        };
                        $timeout(redireccionar, 2000);
                    } else {
                        messageErrorApi(response.msg, "Corregir turnos", "error");
                    }
                    //console.log('Guardando'+angular.toJson(datosPromotion,true));
                }).error(function(data, status, headers) {
                    messageErrorApi(status, "Error", "warning");
                });
                //console.log('Guardando '+angular.toJson(datosPromotion,true));

            } else {
                datosPromotionEditar.event_id = parseInt($stateParams.id);

                PromotionDataFactory.updatePromotion(datosPromotionEditar).success(function(response) {
                    //console.log(angular.toJson(response,true));
                    messageAlert("Success", "Se actualizado la promoción con éxito", "success");
                    var redireccionar = function() {
                        $state.go('promotion-list');
                    };
                    $timeout(redireccionar, 2000);
                }).error(function(data, status, headers) {
                    messageErrorApi(status, "Error", "warning");
                });
                //console.log('Actualizando '+angular.toJson(datosPromotion,true));
            }

        } else {
            messageAlert("Promoción", "Debe ingresar descripcion de la promoción", "warning");
        }

    };

    /*Accion Cancelar imagen cargada*/
    $scope.clearImagePromotion = function() {
        delete $scope.promotion.myImage;
        delete $scope.croppedDataUrl;
    };


    /*Apertura modal Turno*/
    $scope.modalContent = TurnosPromotionDataFactory.getTurnosItems();

    function modalInstances(animation, size, backdrop, keyboard) {
        var modalInstance = $uibModal.open({
            animation: animation,
            templateUrl: 'myModalContent.html',
            controller: 'TurnoInstanceCtrl',
            size: size,
            resolve: {
                content: function() {
                    return $scope.modalContent;
                }
            }
        });
    }
    $scope.openModal = function(size) {
        modalInstances(true, size, true, true);
    };

    /*Apertura modal Fecha de caducidad*/
    $scope.open = function($event, opened) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope[opened] = true;
    };
    //$scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    //$scope.format = $scope.formats[0];


    /*Apertura modal Configurar zonas de paga*/
    $scope.invocarZonas = function(item) {
        openModalZones(item);
    };
    var openModalZones = function(item) {
        modalInstancesZones(item);
    };

    function modalInstancesZones(item) {
        var modalInstance = $uibModal.open({
            templateUrl: 'myModalContentZone.html',
            controller: 'ZoneInstanceCtrl',
            size: 'lg',
            resolve: {
                content: function() {
                    return $scope.promotion.zonas;
                },
                type_event: function() {
                    return item;
                }
            }
        });
    }

})

.controller('TurnoInstanceCtrl', function($scope, $stateParams, $modalInstance, $filter, TurnosPromotionDataFactory, content, PromotionFactory) {

    $scope.listTurnos = content;

    /*Funcion que guarda dias seleccionados*/
    var getDaysSelected = function(days) {
        var daysData = [];
        angular.forEach(days, function(data, key) {
            if (data) {
                daysData.push({ day: key });
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

    $scope.turnoIndex = 0;

    /*Manejar la visualizacion de listado de turnos creados*/
    var cantidad = $scope.listTurnos.length;
    if (cantidad > 0) {
        $scope.existeTurno = true;
    } else {
        $scope.existeTurno = false;
    }

    $scope.turnos = {
        semana: [
            { id: 0, label: 'Domingo', disabled: false, checked: false },
            { id: 1, label: 'Lunes', disabled: false, checked: false },
            { id: 2, label: 'Martes', disabled: false, checked: false },
            { id: 3, label: 'Miercoles', disabled: false, checked: false },
            { id: 4, label: 'Jueves', disabled: false, checked: false },
            { id: 5, label: 'Viernes', disabled: false, checked: false },
            { id: 6, label: 'Sabado', disabled: false, checked: false },
        ],
        turnoSelected: [],
        hours_ini: '',
        hours_end: '',
        disposiciones: [{ id: 1, name: 'Aplicar siempre' }, { id: 2, name: 'Añadir turno a la promocion' }],
    };

    /*Manejar la visualizacion opciones de Turno*/
    if ($scope.listTurnos !== '') {
        $scope.turnos.disposicionSelected = { id: 2, name: 'Añadir turno a la promocion' };
    } else {
        $scope.turnos.disposicionSelected = { id: 1, name: 'Aplicar siempre' };
    }

    /*Funcion para obtener los horarios de un micrositio*/
    var getHorarios = function() {
        PromotionFactory.listSchedules().then(function success(data) {
            $scope.turnos.hours_ini = data;
            $scope.turnos.hours_end = data;
        }, function error(data) {
            messageErrorApi(data, "Error", "warning");
        });
    };
    getHorarios();


    var promotionId = $stateParams.id;
    if (promotionId) {
        angular.forEach($scope.listTurnos, function(turn) {
            if (turn) {
                var days = turn.days;
            }
        });
    }

    /*Accion de boton Añadir*/
    $scope.addTurno = function() {

        var cantidadSel = $scope.turnos.turnoSelected.length;
        if (cantidadSel > 0) {
            if ($scope.turnos.hour_ini && $scope.turnos.hour_end) {
                if ($scope.turnos.hour_ini.time != $scope.turnos.hour_end.time) {
                    var days = getDaysSelected($scope.turnos.turnoSelected);
                    $scope.turnoSelected = days;

                    $scope.turnos.hours_ini = $scope.turnos.hour_ini.time_ori;
                    $scope.turnos.hours_end = $scope.turnos.hour_end.time_ori;

                    var opciones = {
                        days: $scope.turnoSelected,
                        hours_ini: $scope.turnos.hours_ini,
                        hours_end: $scope.turnos.hours_end,
                    };

                    var promotionId = $stateParams.id;
                    if (promotionId) {
                        //var turnOpciones=[];
                        //turnOpciones.push(opciones);
                        var newopciones = {
                            shift_promotion: opciones
                        };
                        TurnosPromotionDataFactory.createTurnPromotion(promotionId, newopciones).success(function(response) {
                            if (response.success) {
                                opciones.turn_id = response.data;
                                //console.log('Enviando'+angular.toJson(opciones,true));
                                TurnosPromotionDataFactory.setTurnosItems(opciones);
                                cleanTurno();
                            } else {
                                cleanTurno();
                                messageAlert("Corregir turnos", response.msg, "error");
                            }
                        });

                    } else {
                        TurnosPromotionDataFactory.setTurnosItems(opciones);
                        cleanTurno();
                    }

                    $scope.existeTurno = true;

                } else {
                    messageAlert("Corregir horas", "Hora de inicio coincide con Hora final", "error");
                }
            } else {
                messageAlert("Turnos", "Debe seleccionar campos de hora", "warning");
            }
        } else {
            messageAlert("Turnos", "Debe seleccionar al menos un dia de la semana", "warning");
        }

    };

    /*Accion de boton Eliminar turno*/
    $scope.deleteTurno = function(item, turn) {
        var promotionId = $stateParams.id;
        $scope.turnoIndex = item;
        if (promotionId) {
            TurnosPromotionDataFactory.deleteTurnPromotion(promotionId, turn.turn_id);
            //console.log(angular.toJson('Pasar promocion '+promotionId+' y turno ha eliminar '+turn.turn_id,true));
        }

        //$scope.listTurnos.splice($scope.turnoIndex,1);
        TurnosPromotionDataFactory.delTurnosItem($scope.turnoIndex);
        cleanTurno();
    };

    /*Funcion para limpiar input de entrada*/
    var cleanTurno = function() {
        getHorarios();
        $scope.turnos.hour_ini = '';
        $scope.turnos.hour_end = '';
        $scope.turnos.turnoSelected = [];
    };

    /*Accion de boton Cerrar modal*/
    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

})

.controller('ZoneInstanceCtrl', function($rootScope, $scope, $uibModal, $modalInstance, $filter, content, type_event) {

    $scope.listZones = content; //Todas las zonas en blanco
    $rootScope.itemTables = []; //Array para cuadros moraditos 
    $scope.type_event = type_event;
    //console.log($scope.type_event);


    /***************Funcion ejecutada por directiva****************/

    $scope.activarTableOptions = function(index, data) {

        var numero = $rootScope.itemTables.length;

        if (numero > 0) {
            var index = $rootScope.itemTables.indexOf(data);
            if (index > -1) {
                $rootScope.itemTables.splice(index, 1);
            } else {
                $rootScope.itemTables.push(data);
            }
        } else {
            $rootScope.itemTables.push(data);
        }
        //console.log('Seleccionados: '+angular.toJson($scope.itemTables, true));

    };


    $scope.addPrecio = function() {
        if ($rootScope.itemTables.length > 0) {
            modalInstancesPrices($scope.type_event);
        } else {
            messageAlert("Añadir precio", "Debe seleccionar al menos una mesa", "warning");
        }
    };

    function modalInstancesPrices(type_event) {
        var modalInstance = $uibModal.open({
            templateUrl: 'myModalContentPrice.html',
            controller: 'PriceInstanceCtrl',
            size: 'sm',
            resolve: {
                content: function() {
                    return $rootScope.itemTables;
                },
                type_event: function() {
                    return type_event;
                },
            }
        });
    }
    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };


    $scope.desactivarTable = function(index, data) {
        modalInstancesdesactivaPrices(index, data);
    };

    function modalInstancesdesactivaPrices(index, data) {
        var modalInstance = $uibModal.open({
            templateUrl: 'myModalContentdesactivaPrice.html',
            controller: 'DesactivaPriceInstanceCtrl',
            size: 'sm',
            resolve: {
                content: function() {
                    return data;
                }
            }
        });
    }

})

.controller('PriceInstanceCtrl', function($rootScope, $stateParams, $scope, $modalInstance, $filter, content, type_event, ZonesActiveFactory, PromotionDataFactory) {

    $scope.itemTables = content;
    $scope.precioDefault = "";
    var promotionId = $stateParams.id;

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
    $scope.savePrecio = function() {
        if ($scope.precioDefault === "") {
            messageAlert("Añadir precio", "Debe ingresar precio para mesas selecionadas", "warning");
        } else {

            var vTable = {
                event_id: parseInt(promotionId),
                type_event: parseInt(type_event),
                tables_pay: []
            };

            angular.forEach($scope.itemTables, function(table) {
                vTable.tables_pay.push({ table_id: table.table_id, price: $scope.precioDefault, zone_id: table.zone_id });
            });


            if (promotionId) {
                PromotionDataFactory.createTablesPayment(vTable).success(function(data) {
                    //console.log(data);
                }, function error(data) {
                    messageErrorApi(data, "Error", "warning");
                });
                //console.log('Guardar: '+angular.toJson(vTable,true));
            }

            angular.forEach($scope.itemTables, function(objeto) {
                objeto.price = $scope.precioDefault;
                ZonesActiveFactory.setZonesItems(objeto);
            });
            $rootScope.itemTables = [];
            $modalInstance.close();
        }
    };
    $scope.deleteTable = function(item, index) {
        var idelemento = '#el' + $scope.itemTables[index].table_id;
        angular.element(idelemento).removeClass('selected-table');
        $scope.itemTables.splice(index, 1);
    };

})

.controller('DesactivaPriceInstanceCtrl', function($rootScope, $scope, $stateParams, $modalInstance, $filter, content, ZonesActiveFactory, PromotionDataFactory) {

    var promotionId = $stateParams.id;
    $scope.itemPrices = content;
    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
    $scope.cleanPrecio = function() {
        var indexforma = $scope.itemPrices.price = "";
        if (promotionId) {
            PromotionDataFactory.deleteTablesPayment(promotionId, $scope.itemPrices.table_id);
        }
        ZonesActiveFactory.delZonesItem($scope.itemPrices);
        $modalInstance.close();
        $scope.itemPrices = [];
    };

});
