angular.module("tables.app")
    .controller("privilegeCtrl", ["privileges", function(privileges) {
        var vm = this;

        var privilegesHelper = function(list, prefix) {
            this.prefix = prefix || "";
            this.data = list || [];
        };

        privilegesHelper.prototype.exists = function(privilege) {
            return this.data.indexOf(this.prefix + privilege) !== -1;
        };

        privilegesHelper.prototype.contains = function() {
            for (i = 0; i< arguments.length;i++){
                if (this.data.indexOf(this.prefix + arguments[i]) !== -1) return true;
            }
            return false;
        };

        vm.ms = new privilegesHelper(privileges, "adminms-table-");
        console.log(vm.ms.data);
    }]);