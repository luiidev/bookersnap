angular.module("widget.app")
    .controller("widgetCtrl", ["$scope", "$sce", "MenuConfigFactory", "IdMicroSitio", function($scope, $sce, menu, IdMicroSitio) {
        var vm = this;

        vm.url="http://localhost/w/"+ IdMicroSitio;
        vm.params = "#/?orientation=vertical";
        vm.iframe = templateIframe(vm.url + vm.params);
        vm.iframesrc = vm.url + vm.params;

        $("#color").change(function() {
            $scope.$apply(function(){
                vm.params= '#/?orientation=vertical&color=' + $("#color").val();
                vm.iframe =  templateIframe(vm.url + vm.params);
            });
        });

        vm.generateIframe = function() {
            vm.iframesrc = $sce.trustAsResourceUrl(vm.url + randon() + vm.params);
        };

        function randon() {
           return "?r=" + Math.round (Math.random() * 100 + 1);
        }

        function templateIframe (src) {
            return '<iframe id="bookersnap-widget" frameborder="0" width="260" height="535" src="' +src + '"></iframe>';
        }

        (function() {
            jsc.register();
            menu.menuActive(3);
        })();

    }]);