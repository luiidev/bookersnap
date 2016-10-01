angular.module('reservation.service', [])
.factory("screenHelper", ["$window", "screenSize", function($window, screenSize) {
    var size = function(vm) {

        var width = $window.innerWidth;
        var height = $window.innerHeight;
        var size;
        
        if (width >= height){
            height -= screenSize.header;
            if (height  < screenSize.minSize) {
                size =  screenSize.minSize;
            } else {
                size = height ;
            }
        } else {
            width -= screenSize.menu;
            if (width  < screenSize.minSize) {
                size =  screenSize.minSize;
            } else {
                size = width;
            }
        }

        return size - 30;
    };

    var minSize = function(){
        return screenSize.minSize;
    };

    return {
        size: size,
        minSize: minSize
    };
}]);