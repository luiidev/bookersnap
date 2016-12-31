angular.module("widget.app", [])
    .config(["$stateProvider", function($stateProvider) {
        $stateProvider.state('mesas.widget', {
            url: '/widget',
            views: {
                '@': {
                    templateUrl: '/js/app/tables/widget/views/index.html',
                    controller: "widgetCtrl",
                    controllerAs: 'vm',
                }
            },
        });
    }]);