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
            var clone;
            element.draggable({
                helper: "clone",
                // revert: true,
                // scroll:true,
                // containment: '#lienzo',
                // appendTo: 'body',
                cursorAt: {
                    left: 16,
                    top: 16
                },
                // grid: [ 20, 20 ],
                // cursor: "move",
               // cursorAt: { top: -12, left: -20 },
               // axis: "x",s
                drag: function(event, ui) {

                    // $(ui.helper[0]).parent().css("transform", "translate(0,0) rotate(0deg)");
                    // $(ui.helper[0]).css("transform", "translate(0,0) rotate(0deg)");
                    $(ui.helper).css("background-color", "red");
                    // console.log(ui);
                    // ui.position.top++;
                    // ui.position.left++;
                    // ui.position.top -= 10;
                    // var dropElem = ui.helper;
                    // // console.log(dropElem);
                    //  var clone = $(dropElem).clone();<

                    // clone.css('top', ui.position.top - 400);
                    // clone.css('left', ui.position.left - 0);
                    // console.log(clone.offset());
                    
                    // $(ui.helper[0]).css("z-index", 100000);
                    // console.log($(element).clone().css("background-color", "red"));
                },
                start: function(event, ui) {
                    console.log("start");
                    // console.log(ui);
                    // clone = $(ui.helper[0]);
                    $(ui.helper).css('z-index','999999');
                    $(ui.helper).css('position','fixed');
                    // parentClone.css("transform", "translate(0,0) rotate(0deg)");
                    // parentClone.css("background-color", "red");
                    // console.log(parentClone);
                },
                stop: function(event, ui) {
                    console.log("stop");
                    // parentClone.css("transform", "translate(0,0) rotate(-45deg)");
                    // console.log(parentClone);
                }
            });
        }

        return {
            scope: {
            },
            link: makeDraggable,
        };

    });