angular.module("App")
    .directive("timeDown", ["$timeout", "$window", "$location", function($timeout, $window, $location) {
        return {
            restrict: 'E',
            scope: {
                expire: "=?",
            },
            template: '<span>{{  time }}</span>',
            link: function(vm, element, attrs) {
                var expire = ~~Number(vm.expire);

                if (expire <= 0) redirect();

                var time = moment.utc(expire);

                function watch() {
                    vm.time = time.subtract(1, "seconds").format("mm:ss");
                    if (time.minute() === 0 && time.second() === 0) redirect();
                    $timeout(watch, 1000);
                }

                function redirect() {
                     $window.location.href = $location.protocol() + "://" + $location.host() + "/w/" + microsite;
                }

                watch();
            }
        };
    }]);