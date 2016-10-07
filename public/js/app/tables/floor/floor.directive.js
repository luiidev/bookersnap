angular.module('floor.directive', [])
    .directive('ngDetailTable', function() {

        function makeSelectTable(scope, element, attr) {

            var left = attr.x;
            var top = attr.y;
            var borde = "";
            var color = (attr.color) ? attr.color : 'none';
            if (color == 'none') {
                borde = '';
            } else {
                borde = '2px solid ' + attr.color;
            }

            element.css({
                position: 'absolute',
                cursor: 'pointer',
                top: top + 'px',
                left: left + 'px',
                border: borde,
                none: 'none',
            });

            element.droppable({
                accept: ".listado-column",
                drop: function(event, ui) {
                    //console.log(ui.draggable[0].id);
                    scope.$apply(function() {
                        scope.num = ui.draggable[0].id;
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
                    //console.log(ui.position.left);
                },
                start: function(event, ui) {
                    angular.element('#bg-window-floor').addClass('drag-dispel');
                },
                stop: function(event, ui) {
                    angular.element('#bg-window-floor').removeClass('drag-dispel');
                }
            });
        }

        return {
            link: makeDraggable,
        };

    });