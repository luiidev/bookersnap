angular.module("tables.app")
    .controller("privilegeCtrl", ["privileges", function(privileges) {
        var vm = this;

        var privilegesHelper = function(list, prefix) {
            this.prefix = prefix || "";
            this.data = list || [];
            this.root = false;

            if (list.length > 0) {
                if (list[0] == "adminms-table-root") {
                    this.root = true;
                }
            }

        };

        privilegesHelper.prototype.exists = function(privilege) {
            return this.data.indexOf(this.prefix + privilege) !== -1 || this.root;
        };

        privilegesHelper.prototype.contains = function() {
            if (this.root) return true;
            for (i = 0; i< arguments.length;i++){
                if (this.data.indexOf(this.prefix + arguments[i]) !== -1) return true;
            }
            return false;
        };

        vm.ms = new privilegesHelper(privileges, "adminms-table-");
        console.log(vm.ms.data);
    }]);