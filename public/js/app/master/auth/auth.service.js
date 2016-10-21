/**
 * Created by BS on 23/08/2016.
 */

angular.module('auth.app')
    //-----------------------------------------------
    // SERVICIO DE ACCESO
    //-----------------------------------------------
    .service('AccessService', function() {
        this.check = function($q, AclService, $action) {
            if (AclService.can($action)) {
                return true;
            } else {
                return $q.reject('Unauthorized');
            }
        };
    });