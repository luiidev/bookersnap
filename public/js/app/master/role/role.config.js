angular.module('role.app', ['role.controller', 'role.service'])
    .config(function ($stateProvider) {
        $stateProvider
            .state ('roles-list', {
                url: '/roles',
                templateUrl: '/js/app/master/role/view/roles-list.html',
                controller: 'RolesListController',
                controllerAs: 'vm'
            })

            .state ('roles-privileges', {
                url: '/roles/:id/privileges',
                templateUrl: '/js/app/master/role/view/roles-privileges.html',
                controller: 'RolesPrivilegesController',
                controllerAs: 'vm'
            })
    });