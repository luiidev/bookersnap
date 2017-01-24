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
    }])
    .directive("bsToggleClick", ["$document", function($document) {
        return {
            restrict: 'A',
            scope: {
                bsClose: "&",
                bsOpen: "&"
            },
            link: function(scope, element, attrs) {
                var parent = $(element).closest("[bs-toggle-click]").parent().parent();
                var children = parent.find("[bs-toggle-show]");

                var closeChildren = function(evt) {
                    if ($.contains(parent.get(0), evt.target)) {
                        children.removeClass("ng-hide");
                        $document.bind('click');
                    } else {
                        children.addClass("ng-hide");
                        $document.unbind('click');
                        scope.bsClose();
                        if (!scope.$$phase && !scope.$root.$$phase) {
                            scope.$apply();
                        }
                    }
                };

                element.bind("click", function(evt) {
                    if (children) {
                        children.toggleClass("ng-hide");

                        if (children.hasClass("ng-hide")) {
                            scope.bsClose();
                            $document.unbind('click', closeChildren);
                        } else {
                            scope.bsOpen();
                            $document.bind('click', closeChildren);
                        }
                        if (!scope.$$phase && !scope.$root.$$phase) {
                            scope.$apply();
                        }
                    }
                });

                children.addClass("ng-hide");
            }
        };
    }])
    .directive('onBeforePrint', ['$window', '$rootScope', '$timeout', function onBeforePrint($window, $rootScope, $timeout) {
            var beforePrintDirty = false;
            var listeners = [];

            var beforePrint = function() {
                    if (beforePrintDirty) return;

                    beforePrintDirty = true;				

                    if (listeners) {
                            for (var i = 0, len = listeners.length; i < len; i++) {
                                    listeners[i].triggerHandler('beforePrint');
                            }

                            var scopePhase = $rootScope.$$phase;

                            // This must be synchronious so we call digest here.
                            if (scopePhase != '$apply' && scopePhase != '$digest') {
                                    $rootScope.$digest();
                            }
                    }

                    $timeout(function() {
                            // This is used for Webkit. For some reason this gets called twice there.
                            beforePrintDirty = false;
                    }, 100, false);
            };

            if ($window.matchMedia) {
                    var mediaQueryList = $window.matchMedia('print');
                    mediaQueryList.addListener(function(mql) {
                            if (mql.matches) {
                                    beforePrint();
                            }
                    });
            }

            $window.onbeforeprint = beforePrint;

            return function(scope, iElement, iAttrs) {
                    function onBeforePrint() {
                            scope.$eval(iAttrs.onBeforePrint);
                    }

                    listeners.push(iElement);
                    iElement.on('beforePrint', onBeforePrint);

                    scope.$on('$destroy', function() {
                            iElement.off('beforePrint', onBeforePrint);

                            var pos = -1;

                            for (var i = 0, len = listeners.length; i < len; i++) {
                                    var currentElement = listeners[i];

                                    if (currentElement === iElement) {
                                            pos = i;
                                            break;
                                    }
                            }

                            if (pos >= 0) {
                                    listeners.splice(pos, 1);
                            }
                    });
            };
    }]);