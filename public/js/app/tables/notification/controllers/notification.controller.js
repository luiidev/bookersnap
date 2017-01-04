angular.module("materialAdmin")
    .controller('notificationCtrl', ["$scope", "notificationService", function($scope, service) {
        vm = this;

        vm.notification_count = 0;
        vm.reservations = [];
        vm.next_page_url = null;

        vm.prevReserves = function(){
            if (vm.next_page_url) {
                getNotifications(vm.next_page_url);
            }
        };

        var getNotifications = function(url)
        {
            service.getNotifications(url)
                .then(function(response) {
                    vm.notification_count = response.data.data.notification_count;
                    var data = response.data.data.paginate.data;
                    angular.forEach(data, function(item) {
                        vm.reservations.push(item);
                    });
                    vm.next_page_url = response.data.data.paginate.next_page_url;
                })
                .catch(function(error) {
                    console.log(error);
                });
        };

        vm.clearNotifications = function() {
            service.clearNotifications()
                .finally(function() {
                    vm.notification_count = 0;
                });
        };

        (function Init() {
            getNotifications();
        })();
    }]);