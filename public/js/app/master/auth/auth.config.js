angular.module('auth.app', ['mm.acl'])
    //-----------------------------------------------
    // SE ESTABLECE EL ACL
    //-----------------------------------------------
    .run(function (AclService, PrivilegeService, $rootScope, $state, $http) {
        setAuthHeaders($http);
        //alert(PrivilegeService.GetRole())
        AclService.setAbilities(PrivilegeService.GetAcl());
        // Attach the member role to the current user
        AclService.attachRole(PrivilegeService.GetRole());

        $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
            if (error === 'Unauthorized') {
                $state.go('access-denied');
            }
        })
    })
    //-----------------------------------------------
    // RUTAS DE AUTH
    //-----------------------------------------------
    .config(function ($stateProvider) {
        $stateProvider
            .state ('access-denied', {
                url: '/denied',
                templateUrl: '/js/app/master/auth/view/denied.html'
            })
    })
