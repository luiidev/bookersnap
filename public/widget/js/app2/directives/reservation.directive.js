angular.module("App")
    .directive("timeDown", ["$timeout", "$window", "$location", function($timeout, $window, $location) {
        return {
            restrict: 'E',
            scope: {
                expire: "=?",
                finally: "&onFinish"
            },
            template: '<span>{{  time }}</span>',
            link: function(vm, element, attrs) {
                var time, expire;

                vm.$watch("expire", function() {
                    if (vm.expire !== undefined) {
                        expire = ~~Number(vm.expire);
                        time = moment.utc(expire);

                        if (expire <= 0 ) {
                            close();
                        } else {
                            watch();
                        }
                    }
                });

                function watch() {
                   vm.time = time.subtract(1, "seconds").format("mm:ss");
                   if (time.minute() === 0 && time.second() === 0) close(true);
                   $timeout(watch, 1000);
                }

                function close(exeEvent) {
                    if (exeEvent) vm.finally();
                }
            }
        };
    }]);