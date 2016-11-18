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
    .constant("ApiUrlMesas", 'http://api-mesas.vh/v1/es/microsites/' + idMicrositio)
    .constant("ApiUrlRoot", 'http://api-mesas.vh/v1/es');