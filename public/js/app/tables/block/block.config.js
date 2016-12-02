angular.module('block.app', ['block.controller', 'block.service', 'block.directive'])
    .constant("screenSizeBlock", {
        minSize: 450,
        header: 112,
        menu: 400
    })
    .config(function($stateProvider, $urlRouterProvider) {
        // var PreviousState = [
        //     "$state",
        //     function($state) {
        //         var currentStateData = {
        //             name: $state.current.name,
        //             params: $state.params,
        //             url: $state.href($state.current.name, $state.params)
        //         };
        //         return currentStateData;
        //     }
        // ];

        $stateProvider
            .state('mesas.floor.block', {
                url: '/:date/block',
                views: {
                    '@': {
                        templateUrl: '/js/app/tables/block/view/create.old.html',
                        controller: 'blockCtr',
                        cache: false,
                    }
                },
                resolve: {
                    $title: function() {
                        return 'Crear Bloqueos';
                    },
                    // PreviousState: PreviousState
                }
            })
            .state('mesas.book.block', {
                url: '/block',
                views: {
                    '@': {
                        templateUrl: '/js/app/tables/block/view/create.old.html',
                        controller: 'blockCtr',
                        cache: false,
                    }
                },
                resolve: {
                    $title: function() {
                        return 'Crear Bloqueos';
                    },
                    // PreviousState: PreviousState
                }
            })
            .state('mesas.floor.blockEdit', {
                url: '/:date/block/:block_id',

                views: {
                    '@': {
                        templateUrl: '/js/app/tables/block/view/edit.new.html',
                        controller: "blockCtr",
                    }
                },
                resolve: {
                    $title: function() {
                        return 'Editar Bloqueo';
                    },
                    // PreviousState: PreviousState
                }
            });
    });