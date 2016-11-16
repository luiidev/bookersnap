angular.module('floor.service')
    .factory('WaitListFactory', function($q, $interval, FloorFactory, reservationService) {
        return {
            getWailList: function(reload) {
                var defered = $q.defer();
                var self = this;
                FloorFactory.getReservations(reload).then(
                    function success(response) {
                        var waitList = {
                            actives: [],
                            canceled: []
                        };

                        angular.forEach(response, function(reservation) {
                            if (reservation.wait_list == 1) {
                                if (reservation.res_reservation_status_id != 6) {
                                    reservation.minutes = calculateMinutesTime("2016-11-08 " + reservation.quote);
                                    reservation.time_out = false;

                                    var interval = function() {
                                        var now = moment();
                                        var start_time = moment(reservation.start_time, "HH:mm:ss");
                                        reservation.time_wait_list = moment.utc(now.diff(start_time)).format("HH:mm");

                                        var validaTime = calculateMinutesTime("2016-11-08 " + reservation.time_wait_list);

                                        if (validaTime >= reservation.minutes) {
                                            reservation.time_out = true;
                                            $interval.cancel(interval);
                                        }

                                        // console.log(calculateMinutesTime("2016-11-08 " + reservation.time_wait_list));
                                    };

                                    interval();
                                    $interval(interval, 60000);

                                    waitList.actives.push(reservation);
                                } else {
                                    waitList.canceled.push(reservation);
                                }
                            }
                        });

                        defered.resolve(waitList);
                    },
                    function error(response) {
                        defered.reject(response);
                    }
                );

                return defered.promise;
            },
            setDataWaitList: function(waitListData) {
                var waitList = {
                    actives: [],
                    canceled: []
                };

                angular.forEach(waitListData, function(reservation) {
                    if (reservation.wait_list == 1) {
                        if (reservation.res_reservation_status_id != 6) {
                            reservation.minutes = calculateMinutesTime("2016-11-08 " + reservation.quote);
                            reservation.time_out = false;

                            var interval = function() {
                                var now = moment();
                                var start_time = moment(reservation.start_time, "HH:mm:ss");
                                reservation.time_wait_list = moment.utc(now.diff(start_time)).format("HH:mm");

                                var validaTime = calculateMinutesTime("2016-11-08 " + reservation.time_wait_list);

                                if (validaTime >= reservation.minutes) {
                                    reservation.time_out = true;
                                    $interval.cancel(interval);
                                }
                            };

                            interval();
                            $interval(interval, 60000);

                            waitList.actives.push(reservation);

                        } else {
                            waitList.canceled.push(reservation);
                        }
                    }
                });

                return waitList;
            },
            saveWaitList: function(data, option) {
                var defered = null;

                if (option == "create") {
                    defered = reservationService.createWaitList(data);
                } else {
                    defered = reservationService.updateWaitList(data);
                }

                return defered;
            },
            deleteWaitList: function(waitListActives, waitListCancelled, dataWaitList) {
                //Eliminar de activos
                angular.forEach(waitListActives, function(value, key) {
                    if (value.reservation_id == dataWaitList.reservation_id) {
                        waitListActives.splice(key, 1);
                    }
                });
                //Agregar la lista de espera a cancelados
                waitListCancelled.push(dataWaitList);

                return waitListCancelled;
            },
            updateWaitList: function(waitListActives, dataWaitList) {
                angular.forEach(waitListActives, function(value, key) {
                    if (value.reservation_id == dataWaitList.reservation_id) {
                        waitListActives[key] = dataWaitList;
                    }
                });
            }
        };
    });