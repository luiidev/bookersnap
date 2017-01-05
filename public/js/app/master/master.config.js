/**
 * Created by BS on 12/08/2016.
 */

angular.module('master.app', [
        'category.app',
        'microsite.app',
        'microportal.app',
        'role.app',
        'auth.app'
    ])
    .constant("ApiAdminROOT", 'http://localhost:90/v1/es')
    .constant("UrlApiAdmin", 'http://localhost:90/v1/es');