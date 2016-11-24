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
    .constant("UrlApiAdmin", 'http://apiadmin.studework.vm/v1/es');