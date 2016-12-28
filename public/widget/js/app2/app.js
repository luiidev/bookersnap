angular.module("App", ["ngLocale", "ui.bootstrap"])
    .constant("ApiUrlMesas", 'http://localhost:3004/v1/es/microsites/'+microsite)
    .run(["$location" , function($location) {
        var color = $location.search().color;
        if (color) {
            var style = angular.element("<style type=\"text/css\">.bs-color { color: #"+ color +" !important; } .bs-bgm { background: #"+ color +" !important;color: #fff; } </style>");
            document.querySelector("head").appendChild(style[0]);
        }
    }])
    .run(["$templateCache", function($templateCache) {
      $templateCache.put("template/datepicker/day.html",
        "<table role=\"grid\" aria-labelledby=\"{{::uniqueId}}-title\" aria-activedescendant=\"{{activeDateId}}\">\n" +
        "  <thead>\n" +
        "    <tr class=\"nav\">\n" +
        "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-left\" ng-click=\"move(-1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-left\"></i></button></th>\n" +
        "      <th colspan=\"{{::5 + showWeeks}}\"><button id=\"{{::uniqueId}}-title\" role=\"heading\" aria-live=\"assertive\" aria-atomic=\"true\" type=\"button\" class=\"btn btn-default btn-sm date-label\" ng-click=\"toggleMode()\" ng-disabled=\"datepickerMode === maxMode\" tabindex=\"-1\" style=\"width:100%;\"><strong>{{title}}</strong></button></th>\n" +
        "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-right\" ng-click=\"move(1)\" tabindex=\"-1\"><i class=\"glyphicon glyphicon-chevron-right\"></i></button></th>\n" +
        "    </tr>\n" +
        "    <tr class=\"days\">\n" +
        "      <th ng-if=\"showWeeks\" class=\"text-center\"></th>\n" +
        "      <th ng-repeat=\"label in ::labels track by $index\" class=\"text-center\"><small aria-label=\"{{::label.full}}\">{{::label.abbr}}</small></th>\n" +
        "    </tr>\n" +
        "  </thead>\n" +
        "  <tbody>\n" +
        "    <tr ng-repeat=\"row in rows track by $index\">\n" +
        "      <td ng-if=\"showWeeks\" class=\"text-center h6\"><em>{{ weekNumbers[$index] }}</em></td>\n" +
        "      <td ng-repeat=\"dt in row track by dt.date\" class=\"text-center cell-btn\" role=\"gridcell\" id=\"{{::dt.uid}}\" ng-class=\"::dt.customClass\">\n" +
        "        <button type=\"button\" style=\"min-width:100%;\" class=\"btn btn-default btn-sm\" ng-class=\"{'btn-info': dt.selected, 'active bs-bgm': isActive(dt)}\" ng-click=\"select(dt.date)\" ng-disabled=\"dt.disabled\" tabindex=\"-1\" ng-if=\"!dt.secondary\"><span ng-class=\"::{'text-muted': dt.secondary, 'text-info': dt.current}\">{{::dt.label}}</span></button>\n" +
        "      </td>\n" +
        "    </tr>\n" +
        "  </tbody>\n" +
        "</table>\n" +
        "");
    }])
    .config(function($provide) {
        $provide.decorator('uibDatepickerDirective', ['$delegate',function($delegate) {
            var directive = $delegate[0];

            var link = directive.link;

            directive.$$isolateBindings.monthChanged = {
                attrName: "monthChanged",
                mode: "&",
                optional: true
            };

            directive.compile = function() {
                return function(scope, element, attrs, ctrls) {
                    console.log(scope);
                    link.apply(this, arguments);
                    console.log(scope);
                    scope.$watch(function() {
                       return ctrls[0].activeDate;
                    }, function(newVal, oldVal) {
                        console.log(scope);
                        if (scope.datepickerMode == 'day') {
                            if (oldVal.getMonth() !== newVal.getMonth() || oldVal.getYear() !== newVal.getYear()) {
                                var mDate = moment(newVal);
                                var date = mDate.format("YYYY-MM-DD");
                                var month = mDate.format("MM");
                                var year = mDate.format("YYYY");
                                if (typeof scope.monthChanged == "function") {
                                    scope.monthChanged({"$date": date, "$month": month, "$year": year, "$instance": scope.datepicker, "$select": scope.select});
                                }
                            }
                        }
                    }, true);
                    
                };
            };
            return $delegate;
        }]);
    });