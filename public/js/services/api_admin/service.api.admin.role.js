angular.module("api.admin")
    .factory("RoleServiceApiAdmin", ["http", "_API_ADMIN_URL", function(http, _API_ADMIN_URL) {
        return {
            GetRoles: function() {
                return http.get(_API_ADMIN_URL + '/v1/es/roles', {});
            },
            CreateRole: function(data) {
                return http.post(_API_ADMIN_URL + '/v1/es/roles', data);
            },
            UpdateRole: function(id, data) {
                return http.put(_API_ADMIN_URL + '/v1/es/roles/' + id, data);
            },
            ChangeStatus: function(id, data) {
                return http.put(_API_ADMIN_URL + '/v1/es/roles/' + id + '?option=status', data, {responseType: "text"});
            },
            GetPrivileges: function(id) {
                return http.get(_API_ADMIN_URL + '/v1/es/roles/' + id + '/privileges');
            },
            SavePrivileges: function(id, data) {
                return http.post(_API_ADMIN_URL + '/v1/es/roles/' + id + '/privileges', { privileges: data });
            },
        };
    }]);