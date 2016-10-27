angular.module('floor.directive', [])
    .directive('ngDetailTable', function() {

        function makeSelectTable(scope, element, attr) {

            element.droppable({
                //accept: ".listado-column",
                drop: function(event, ui) {
                    // console.log(ui.draggable[0].dataset.quantity);
                    var quantity = parseInt(ui.draggable[0].dataset.quantity) || 0;
                    scope.$apply(function() {
                        scope.num = {
                            num_men: quantity,
                            num_women: 0,
                            num_children: 0
                        };
                    });
                    scope.onDroppedFn();
                }
            });


            element.on('click', function(event) {
                event.preventDefault();
                scope.onClickFn();
            });
        }

        return {
            link: makeSelectTable,
            scope: {
                num: "=",
                onClickFn: '&',
                onDroppedFn: '&'
            }
        };

    }).directive('ngTable', function() {

        function tableSelected(scope, element, attr) {

            var left = attr.x;
            var top = attr.y;

            element.css({
                position: 'absolute',
                cursor: 'pointer',
                top: top + 'px',
                left: left + 'px',
                border: '2px solid ' + attr.color,
                none: 'none',
            });


            element.on('click', function(event) {

                event.preventDefault();
                scope.onClickFn();

            });
        }

        return {
            link: tableSelected,
            scope: {
                onClickFn: '&'
            }
        };

    })
    .directive('ngDragNumPeople', function() {

        function makeDraggable(scope, element, attr) {

            element.draggable({
                helper: "clone",
                drag: function(event, ui) {
                    // console.log(ui.position.left);
                },
                start: function(event, ui) {
                    angular.element('.bg-window-floor').addClass('drag-dispel');
                    scope.tableFilterFn();
                },
                stop: function(event, ui) {
                    angular.element('.bg-window-floor').removeClass('drag-dispel');
                    scope.tableFilterClearFn();
                }
            });
        }

        return {
            scope: {
                tableFilterFn: "&",
                tableFilterClearFn: "&"
            },
            link: makeDraggable,
        };

    })
    .directive('ngDragUpComing', function() {

        function makeDraggable(scope, element, attr) {

            element.draggable({
                helper: "clone",
                cursorAt: {
                    left: 190
                },
                drag: function(event, ui) {
                    angular.element(".not_selector").draggable("disable");
                    //console.log('x: ' + ui.offset.left + ', ' + 'y: ' + ui.offset.top);
                },
                start: function(event, ui) {
                    angular.element('.bg-window-floor').addClass('drag-dispel');
                    scope.onStartFn();
                },
                stop: function(event, ui) {
                    angular.element('.bg-window-floor').removeClass('drag-dispel');
                    scope.onStopFn();
                }
            });
        }

        return {
            link: makeDraggable,
            scope: {
                onStopFn: '&',
                onStartFn: '&'
            }
        };

    })
    .directive('ngDropTabZones', function() {
        function makeDroppable(scope, element, attr) {
            element.droppable({
                accept: ".listado-column",
                over: function(event, ui) {
                    scope.$apply(function() {
                        scope.onDroppeddFn();
                    });
                },
            });
        }
        return {
            link: makeDroppable,
            scope: {
                onDroppeddFn: '&'
            }
        };
    })
    .directive('ngDragMvReservation', function() {

        function makeDraggable(scope, element, attr) {
            element.draggable({
                helper: "clone",
                revert: true,
                // scroll:true,
                // containment: $('#lienzo'),
                // appendTo: '#lienzo',
                cursorAt: {
                    left: 16,
                    top: 16
                },
                // grid: [ 20, 20 ],
                // cursor: "move",
               // cursorAt: { top: -12, left: -20 },
               // axis: "x",s
                drag: function(event, ui) {
                    // console.log(ui.position, ui.offset);
                    // console.log(ui.helper[0].getBoundingClientRect());
                    // var st = parseInt($(element).data("startingScrollTop"));
                    // ui.position.top -= $(element).parent().scrollTop() - st;
                    // $(element).clone().css({"transform": null});
                    // console.log($(ui.helper[0]).parent().clone());

                    $(ui.helper[0]).parent().css("transform", "translate(0,0) rotate(0deg)");
                    $(ui.helper[0]).css("transform", "translate(0,0) rotate(0deg)");
                    $(ui.helper[0]).css("background-color", "red");
                    $(ui.helper[0]).css("z-index", 100000);
                    // console.log($(element).clone().css("background-color", "red"));
                },
                start: function(event, ui) {
                    console.log("start");
                    // $(element).data("startingScrollTop",$(element).parent().scrollTop());
                },
                stop: function(event, ui) {
                    console.log("stop");
                }
            });
        }

        return {
            scope: {
            },
            link: makeDraggable,
        };

    });