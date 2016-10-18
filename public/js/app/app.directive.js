angular.module("bookersnap.directives", [])
    .constant("loadTime", 5000)
    .directive("loadingBox", ["$interval", "loadTime", function($interval, loadTime) {
        return {
            restrict: 'E',
            scope: {
                waitLoad: "=wait",
                time: "=?",
                bg: "=?",
                pls: "=?"
            },
            template: '<div class="load-parent" ng-show="waitLoad" ng-class="[bg]">\
                              <div class="load-child" ng-class="[with]">\
                                     <div class="preloader" ng-class="[size,pls]">\
                                          <svg class="pl-circular" viewBox="25 25 50 50">\
                                                <circle class="plc-path" cx="50" cy="50" r="20"></circle>\
                                          </svg>\
                                      </div>\
                              </div>\
                        </div>',
            link: function(vm, element, attrs) {
                vm.with = attrs.size || "size-default";
                vm.size = attrs.size ? "pl-" + attrs.size : null;
                vm.bg = attrs.bg ? "bgm-" + attrs.bg : null;
                vm.pls = attrs.pls ? "pls-" + attrs.pls : null;

                var timeoutId;
                vm.time = vm.time || loadTime;

                vm.$watch("waitLoad", function(value) {
                    if (value === true) {
                        destroy();
                        setTime();
                    } else {
                        cancelLoad();
                    }
                });

                function setTime() {
                    timeoutId = $interval(function() {
                        cancelLoad();
                    }, vm.time);
                }

                function cancelLoad() {
                    destroy();
                    vm.waitLoad = false;
                }

                function destroy() {
                    if (timeoutId) {
                        $interval.cancel(timeoutId);
                    }
                }
            }
        };
    }]);