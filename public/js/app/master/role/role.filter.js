angular.module("role.app")
    .filter("roleFilter", [function() {
        return function(list, roleID) {
            if (list !== undefined)
            return list.filter(function(item) {
                return item.bs_type_admin_id == roleID;
            });
        };
    }]);