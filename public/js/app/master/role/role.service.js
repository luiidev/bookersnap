angular.module('role.service', [])
    //--------------------------------------
    // SERVICIO MICROPORTALES
    //--------------------------------------
    .factory('RoleService', function (Ajax) {
        var base_url = '/v1/es/master/ajax/';
        var api_admin_url = 'http://localhost:3000/v1/es/';
        return {
            GetRoles: function ($listener) {
                Ajax.Req('get', api_admin_url + 'roles', null, $listener);
            },
            CreateRole: function ($data, $listener) {
                Ajax.Req('post', base_url + 'roles', $data, $listener);
            },
            UpdateRole: function ($id, $data, $listener) {
                Ajax.Req('put', base_url + 'roles/' + $id, $data, $listener);
            },
            ChangeStatus: function ($id, $data, $listener) {
                Ajax.Req('put', base_url + 'roles/' + $id + '?option=status', $data, $listener);
            },
            GetPrivileges: function ($id, $listener) {
                Ajax.Req('get', api_admin_url + 'roles/' + $id + '/privileges', null, $listener);
            },
            SavePrivileges: function ($id, $data, $listener) {
                Ajax.Req('post', api_admin_url + 'roles/' + $id + '/privileges', $data, $listener);
            },
        }
    });