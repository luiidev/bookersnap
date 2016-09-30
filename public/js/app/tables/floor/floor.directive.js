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


            element.on('click', function(event) {

                event.preventDefault();
                scope.onClickFn();

            });
        }

        return {
            link: makeSelectTable,
            scope: {
                onClickFn: '&'
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

    });