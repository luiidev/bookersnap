angular.module("App")
    .directive("timeDown", ["$timeout", function($timeout) {
        return {
            restrict: 'E',
            scope: {
                start: "=?",
                expire: "=?",
            },
            template: '<span>{{  time }}</span>',
            link: function(vm, element, attrs) {
                var expire = moment(vm.expire);
                var now = moment(vm.start);

                var diff = now.diff(expire);
                var time = moment.utc(diff);

                var watch = function() {
                    vm.time = time.subtract(1, "seconds").format("mm:ss");
                    $timeout(watch, 1000);
                };
                
                watch();
            }
        };
    }]);