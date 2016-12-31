angular.module('grid.directive', [])
    .directive('hoverReservationGrid', function() {
        return {
            restrict: 'A',
            link: function(scope, element, attr) {
                var zIndex = 0;
                element.on('mouseover', function(event) {
                    event.preventDefault();
                    zIndex = element.attr('z-index');
                    angular.element(this).parent().parent().css('z-index', 99);
                    //console.log("mouseover", zIndex);
                });
                element.on('mouseout', function(event) {
                    event.preventDefault();
                    angular.element(this).parent().parent().css('z-index', zIndex);
                    //console.log("mouseout", zIndex);
                });
            }
        };
    })
    .directive('dragReservaGrid', function() {
        return {
            restrict: 'A',
            scope: {
                reservaSelected: "=",
                reservation: "=",
                dragPosition: "=",
                onDragEnd: "&",
                itemSelected: "=",
                tableSelected: "=",
                conflicts: "=",
                conflictsIni: "="
            },
            link: function(scope, element, attr) {
                console.log(scope.conflicts);

                if (scope.conflicts === false || scope.conflictsIni === true) {
                    element.draggable({
                        //containment: ".grid-body",
                        grid: [62, 63],
                        cursor: "move",
                        drag: function(event, ui) {
                            //console.log("dragReservaGrid");
                        },
                        start: function(event, ui) {
                            element.css("transform", "none");
                            element.css("opacity", "0.6");
                            element.css("z-index", "1");

                            scope.$apply(function() {
                                scope.reservaSelected = scope.reservation;
                                scope.tableSelected = scope.itemSelected.id;
                            });

                            console.log("start drag");
                        },
                        stop: function(event, ui) {
                            element.css("opacity", "1");
                            scope.$apply(function() {
                                scope.dragPosition = ui.position;
                            });

                            scope.onDragEnd();
                        }
                    });
                }


            }
        };
    })
    .directive('dropReservaGrid', function() {
        return {
            restrict: 'A',
            scope: {
                grid: "=",
            },
            link: function(scope, element, attr) {

                element.droppable({
                    drop: function(event, ui) {
                        console.log("drop", angular.toJson(scope.grid, true));
                    }
                });
            }
        };
    })
    .directive('dragBlockGrid', function() {
        return {
            restrict: 'A',
            scope: {
                block: "=",
            },
            link: function(scope, element, attr) {

                element.draggable({
                    //containment: ".grid-body",
                    grid: [62, 63],
                    cursor: "move",
                    drag: function(event, ui) {
                        //console.log("dragReservaGrid");
                    },
                    start: function(event, ui) {
                        element.css("transform", "none");
                        element.css("opacity", "0.6");
                        console.log("start drag");
                    },
                    stop: function(event, ui) {
                        element.css("opacity", "1");
                        console.log("stop drag", scope.block.id);
                    }
                });
            }
        };
    })
    .directive('dropReservaGridMaster', function() {
        return {
            restrict: 'A',
            scope: {
                grid: "=",
                table: "="
            },
            link: function(scope, element, attr) {

                element.droppable({
                    drop: function(event, ui) {
                        scope.$apply(function() {
                            scope.table = scope.grid.id;
                        });
                        //console.log("drop", angular.toJson(scope.grid.name, true));
                    }
                });
            }
        };
    })
    .directive('resizeGridReservation', function() {
        return {
            restrict: 'A',
            link: function(scope, element, attr) {
                element.resizable({
                    grid: [62, 63],
                    handles: 'e',
                    resize: function(event, ui) {
                        console.log("resize");
                    }
                });
            }
        };
    });