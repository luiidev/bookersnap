angular.module('microportal.service', [])
    //--------------------------------------
    // SERVICIO MICROPORTALES
    //--------------------------------------
    .factory('MicroportalService', function(Ajax, ApiAdminROOT) {
        var base_url = '/master/ajax/';
        var api_admin_url = ApiAdminROOT;
        return {
            GetPage: function($data, $listener) {
                var $url = api_admin_url + 'microportal';
                Ajax.Req('patch', $url, $data, $listener);
            },
            GetCountries: function($listener) {
                Ajax.Req('get', api_admin_url + 'country', null, $listener);
            },
            GetCities: function($country_id, $listener) {
                Ajax.Req('get', api_admin_url + 'country/' + $country_id + '/cities', null, $listener);
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
            GetCategories: function($listener) {
                Ajax.Req('get', api_admin_url + 'category', null, $listener);
            },
            GetSubcategories: function($category_id, $listener) {
                Ajax.Req('get', api_admin_url + 'category/' + $category_id + '/subcategories', null, $listener);
            },
            CheckSitename: function($sitename, $listener) {
                var data = {
                    sitename: $sitename
                };
                Ajax.Req('post', api_admin_url + 'microportal/sitename', data, $listener);
            },
            SaveMicroportal: function($data, $listener) {
                Ajax.Req('post', base_url + 'microportal', $data, $listener);
            }
        }
    });