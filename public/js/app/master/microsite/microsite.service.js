angular.module('microsite.service', [])
    //--------------------------------------
    // SERVICIO LISTAR MICROSITIO
    //--------------------------------------
    .factory('MicrositeService', function(Ajax, ApiAdminROOT) {
        var base_url = '/master/ajax/';
        var api_admin_url = ApiAdminROOT;
        return {
            GetPage: function($data, $listener) {
                var $url = base_url + 'microsite';
                Ajax.Req('patch', $url, $data, $listener);
            },
            GetCountries: function($listener) {
                Ajax.Req('get', api_admin_url + 'country', null, $listener);
            },
            GetCities: function($country_id, $listener) {
                Ajax.Req('get', api_admin_url + 'country/' + $country_id + '/cities', null, $listener);
            },
            GetCategories: function($listener) {
                Ajax.Req('get', api_admin_url + 'category', null, $listener);
            },
            GetSubcategories: function($category_id, $listener) {
                Ajax.Req('get', api_admin_url + 'category/' + $category_id + '/subcategories', null, $listener);
            },
            GetScores: function($listener) {
                Ajax.Req('get', api_admin_url + 'scoretype', null, $listener);
            },
            GetLocalServices: function($listener) {
                Ajax.Req('get', api_admin_url + 'local-services', null, $listener);
            },
            GetBsServices: function($listener) {
                Ajax.Req('get', api_admin_url + 'bs-services', null, $listener);
            },
            CheckSitename: function($sitename, $msType, $listener) {
                var data = {
                    sitename: $sitename,
                    free: $msType
                };
                Ajax.Req('post', api_admin_url + 'microsite/sitename', data, $listener);
            },
            SaveMicrosite: function($data, $listener) {
                Ajax.Req('post', base_url + 'microsite', $data, $listener);
            }
        };
    });