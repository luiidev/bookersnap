angular.module("notification.app")
    .controller('notificationCtrl', ["$scope", "$rootScope", "$q","notificationService", "reservationService", "$filter", "ServerNotification",
         function($scope, $rootScope, $q, service, reservationService, $filter, ServerNotification) {
        vm = this;

        vm.notification_count = 0;
        vm.reservations = [];
        vm.next_page_url = null;

        vm.prevReserves = function(){
            if (vm.next_page_url) {
                getNotifications(vm.next_page_url)
                    .then(function(){
                        var notifBody = $("#notif-body");
                        notifBody.animate({ scrollTop: notifBody.prop("scrollHeight")}, 800);
                    });
            }
        };

        var getNotifications = function(url)
        {
            var deferred = $q.defer();

            service.getNotifications(url)
                .then(function(response) {
                    vm.notification_count = response.data.data.notification_count;
                    var data = response.data.data.paginate.data;
                    angular.forEach(data, function(item) {
                        vm.reservations.push(item);
                    });
                    vm.next_page_url = response.data.data.paginate.next_page_url;
                    deferred.resolve();
                })
                .catch(function(error) {
                    console.log(error);
                    deferred.reject();
                });

            return deferred.promise;
        };

        vm.clearNotifications = function() {
            if (vm.notification_count) {
                service.clearNotifications()
                    .finally(function() {
                        vm.notification_count = 0;
                    });
            }
        };

        $rootScope.$on("NotifyWebReservation", function(evt, req) {
            var reservation = req.data;
            if (!reservationService.blackList.contains(req.key)) {
                if (reservation.res_source_type_id == 4 && req.action == "create") {
                    if (!$scope.$$phase && !$scope.$root.$$phase) {
                        $scope.$apply(function() {
                            $('#audio_notipromocion')[0].play();
                            vm.reservations.unshift(reservation);
                            vm.notification_count ++;
                            notifyMessage(reservation);
                        });
                    }
                }
            }
        });

        var notifyMessage = function(reservation) {
            var title =  reservation.guest.first_name +" "+ reservation.guest.last_name;
            var date = $filter("latamDate")(reservation.date_reservation+' '+reservation.hours_duration);
            var description = "Hizo una reserva para día " + date + " para " + reservation.num_guest  + " personas.";
            notify(title, description);
        };

        var serverSocket = ServerNotification.getConnection();

        serverSocket.on("b-mesas-floor-res", function(data) {
            $rootScope.$broadcast("NotifyWebReservation", data);
        });

        (function Init() {
            getNotifications();
        })();
    }]);