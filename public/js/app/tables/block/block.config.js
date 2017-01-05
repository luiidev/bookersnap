angular.module('block.app', ['block.controller', 'block.service', 'block.directive', "block.filter"])
    .constant("screenSizeBlock", {
        minSize: 450,
        header: 112,
        menu: 400
    })
    .config(function($stateProvider, $urlRouterProvider) {
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
                }
            })
            .state('mesas.book.blockEdit', {
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
                }
            })
            .state('mesas.grid.block', {
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
                }
            })
            .state('mesas.grid.block.edit', {
                url: '/:block_id/edit',
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
                }
            });
    });