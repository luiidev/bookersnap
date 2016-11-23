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
    .constant("UrlServerNotify", "http://localhost:1337")
    .constant("ApiUrlMesas", 'http://apimesas.studework.vm/v1/es/microsites/')
    .constant("ApiUrlRoot", 'http://apimesas.studework.vm/v1/es');