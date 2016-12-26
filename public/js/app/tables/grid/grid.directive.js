angular.module('grid.directive', [])
    .directive('hoverReservationGrid', function() {
        return {
            restrict: 'A',
            link: function(scope, element, attr) {
                var zIndex = 0;
                element.on('mouseover', function(event) {
                    event.preventDefault();
                    zIndex = element.attr('z-index');
                    angular.element(this).parent().parent().css('z-index', 9999);
                    //console.log("mouseover", zIndex);
                });
                element.on('mouseout', function(event) {
                    event.preventDefault();
                    angular.element(this).parent().parent().css('z-index', zIndex);
                    //console.log("mouseout", zIndex);
                });
            }
        };
    });