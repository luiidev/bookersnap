/**
 * Created by BS on 25/08/2016.
 */

angular.module('calendar.controller', [])
    .controller('CalendarIndexController', function(CalendarService, MenuConfigFactory, $uibModal) {
        var vm = this;
        var now;

        function GetEvents() {
            var month = vm.calendar.fullCalendar('getDate').format('YYYY-MM');
            vm.loading = true;
            CalendarService.GetShiftsByMonth(month, {
                OnSuccess: function(Response) {
                    vm.events = Response.data.data;
                    updateCalendar();
                    vm.loading = false;
                },
                OnError: function(Response) {
                    vm.loading = false;
                }
            });
        }

        function updateCalendar() {
            vm.calendar.fullCalendar('removeEvents');
            vm.calendar.fullCalendar('addEventSource', vm.events);
        }

        function initCalendar() {
            vm.calendar = angular.element('#calendar');

            vm.calendar.fullCalendar({
                header: {
                    right: '',
                    center: 'prev, title, next',
                    left: 'today'
                },
                buttonText: {
                    today: "Hoy"
                },
                locale: 'es',
                theme: true,
                selectable: true,
                selectHelper: true,
                events: vm.events,
                eventOrder: 'start_time',
                eventClick: function(calEvent, jsEvent, view) {
                    OpenDay(calEvent.date);
                },
                dayClick: function(date, jsEvent, view) {
                    var $date = date.format('YYYY-MM-DD');
                    OpenDay($date);
                },
                viewRender: function(view, element) {
                    GetEvents();
                },
                eventRender: function(event, element) {
                    if (CalendarService.isBefore(event.date, now)) {
                        $(element).addClass('event-disabled');
                    }

                    var $text = '<div class="fc-content" >';
                    $text += '<h5 class="text-center" style="color:white;margin: 2px;white-space: pre-line">' + event.title + '</h5>';
                    $text += '<div class="fc-title text-center">' + CalendarService.FormatTime(event.date, event.start_time) + ' - ' + CalendarService.FormatTime(event.date, event.end_time) + '</div>';
                    $text += '</div>';
                    element.html($text);
                }
            });

            // console.log(vm.calendar);
            // console.log(vm.calendar.contents());
        }

        function OpenDay($date) {
            if (CalendarService.isBefore($date, now)) {
                return false;
            }

            var modalInstance = $uibModal.open({
                templateUrl: 'addEvent.html',
                controller: 'DayShiftController',
                controllerAs: 'vm',
                backdrop: 'static',
                keyboard: false,
                resolve: {
                    data: function() {
                        return {
                            date: $date,
                            GetEvents: function() {
                                GetEvents();
                            }
                        };
                    }
                }
            });
        }

        function DateNow() {
            now = moment();
            now.set({
                'hour': 0,
                'minute': 0,
                'second': 0,
                'millisecond': 0
            });
        }

        function init() {
            DateNow();
            initCalendar();
            MenuConfigFactory.menuActive(2);
        }

        init();

    })

.controller('DayShiftController', function(data, $uibModalInstance, CalendarService, $uibModal, $state) {
    var vm = this;
    vm.date = data.date;
    vm.flags = {
        isLoading: false
    };

    vm.shifts = [];

    vm.dismiss = function() {
        $uibModalInstance.dismiss();
    };

    vm.AddSchedule = function(type_shift_id, $name) {
        openDialogShedule(type_shift_id, $name);
    };

    vm.moduleEdit = function(turn) {
        $state.go('turn-edit', {
            turn: turn
        });
        vm.dismiss();
    };

    vm.removeSchedule = function(id) {
        swal({
            title: "Confimar",
            text: "Se va eliminar el turno",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Sí, borrar ahora",
            cancelButtonText: "No, cancelar",
            closeOnConfirm: true,
            closeOnCancel: true
        }, function(isConfirm) {
            if (isConfirm) {
                vm.loading = true;
                CalendarService.DeleteShift(id, vm.date, {
                    OnSuccess: function(Response) {
                        GetData();
                        data.GetEvents();
                        vm.dismiss();
                        vm.loading = false;
                    },
                    OnError: function(Response) {
                        vm.loading = false;
                        message.apiError(Response);
                    }
                });
            }
        });
    };

    function GetData() {
        vm.loading = true;
        CalendarService.GetShiftByDate(vm.date, {
            OnSuccess: function(Response) {
                vm.shifts = Response.data.data;
                vm.loading = false;
            },
            OnError: function(Response) {
                vm.loading = false;
                message.apiError(Response);
            }
        });
    }

    function openDialogShedule(type_shift_id, $name) {
        vm.flags.isLoading = true;
        CalendarService.GetShiftsByType(type_shift_id, {
            OnSuccess: function(Response) {
                vm.flags.isLoading = false;
                try {
                    var $type_shift = {
                        id: type_shift_id,
                        name: $name
                    };
                    var modalInstance = $uibModal.open({
                        templateUrl: 'schedule.html',
                        controller: 'ScheduleShiftController',
                        controllerAs: 'vm',
                        backdrop: 'static',
                        keyboard: false,
                        resolve: {
                            data: function() {
                                return {
                                    modalInstance: $uibModalInstance,
                                    typeShift: $type_shift,
                                    date: vm.date,
                                    shifts: Response.data.data,
                                    updateShifts: function() {
                                        GetData();
                                        data.GetEvents();
                                    }
                                };
                            }
                        }
                    });
                } catch (e) {
                    swal("Error", "Ocurrió un error en el servidor", "error");
                }
            },
            OnError: function(Response) {
                vm.flags.isLoading = false;
                try {
                    if (Response.status == 401 || Response.status == 403) {
                        swal("Error", "No tiene permisos para realizar esta acción", "error");
                    } else {
                        swal("Error", "Ocurrió un error en el servidor", "error");
                    }
                } catch (e) {
                    swal("Error", "Ocurrió un error en el servidor", "error");
                }
            }
        });
    }

    vm.changeSchedule = function(type_shift_id, $name, turn_id) {
        openDialogChangeShedule(type_shift_id, $name, turn_id);
    };

    function openDialogChangeShedule(type_shift_id, $name, turn_id) {
        vm.flags.isLoading = true;
        CalendarService.GetShiftsByType(type_shift_id, {
            OnSuccess: function(Response) {
                vm.flags.isLoading = false;
                try {
                    var $type_shift = {
                        id: type_shift_id,
                        name: $name
                    };
                    var modalInstance = $uibModal.open({
                        templateUrl: 'changeSchedule.html',
                        controller: 'ScheduleChangeController',
                        controllerAs: 'vm',
                        backdrop: 'static',
                        keyboard: false,
                        resolve: {
                            data: function() {
                                return {
                                    modalInstance: $uibModalInstance,
                                    turn_id: turn_id,
                                    typeShift: $type_shift,
                                    date: vm.date,
                                    shifts: Response.data.data,
                                    updateShifts: function() {
                                        GetData();
                                        data.GetEvents();
                                    }
                                };
                            }
                        }
                    });
                } catch (e) {
                    swal("Error", "Ocurrió un error en el servidor", "error");
                }
            },
            OnError: function(Response) {
                vm.flags.isLoading = false;
                try {
                    if (Response.status == 401 || Response.status == 403) {
                        swal("Error", "No tiene permisos para realizar esta acción", "error");
                    } else {
                        swal("Error", "Ocurrió un error en el servidor", "error");
                    }
                } catch (e) {
                    swal("Error", "Ocurrió un error en el servidor", "error");
                }
            }
        });
    }

    function init() {
        var $date = moment(vm.date);

        vm.fulldate = ($date.format("dddd D [de] MMMM [de] YYYY"));

        GetData();
    }

    init();
})

.controller('ScheduleShiftController', function(data, $uibModalInstance, CalendarService) {
    var vm = this;
    vm.typeShift = data.typeShift;
    vm.shifts = data.shifts;
    vm.date = data.date;
    vm.flags = {
        isLoading: false
    };
    var modalInstanceBefore = data.modalInstance;

    vm.dismiss = function() {
        $uibModalInstance.dismiss();
    };

    vm.am_pm = function(time) {
        return CalendarService.FormatTime(vm.date, time);
    };

    vm.schedule = function(shift_id) {
        vm.flags.isLoading = true;
        CalendarService.ScheduleShift(shift_id, vm.date, {
            OnSuccess: function(Response) {
                vm.flags.isLoading = false;
                try {
                    if (Response.data.statuscode == 201) {
                        data.updateShifts();
                        messageAlert('Turno Programado', '', 'success');
                        vm.dismiss();
                        modalInstanceBefore.dismiss();
                    }
                } catch (e) {
                    swal("Error", "Ocurrió un error en el servidor", "error");
                }
            },
            OnError: function(Response) {
                vm.flags.isLoading = false;
                try {
                    swal("Error", Response.data.error.user_msg, "error");
                } catch (e) {
                    swal("Error", "Ocurrió un error en el servidor", "error");
                }
            }
        });
    };

    function init() {
        var $moment = moment(vm.date);
        vm.formatted_date = $moment.format('MMMM DD');
        vm.day_name = $moment.format('dddd') + ($moment.day() == 6 || $moment.day() == 0 ? 's' : '');
    }

    init();
})

.controller('ScheduleChangeController', function(data, $uibModalInstance, CalendarService) {
    var vm = this;
    vm.typeShift = data.typeShift;
    vm.date = data.date;
    var turn_id = data.turn_id;
    var modalInstanceBefore = data.modalInstance;

    vm.dismiss = function() {
        $uibModalInstance.dismiss();
    };

    vm.am_pm = function(time) {
        return CalendarService.FormatTime(vm.date, time);
    };

    vm.changeCheduless = function(shift_id) {
        vm.loading = true;
        CalendarService.ChangeSchedule(turn_id, shift_id, vm.date, {
            OnSuccess: function(Response) {
                vm.loading = false;
                try {
                    if (Response.data.statuscode == 201) {
                        data.updateShifts();
                        message.success('Turno Reprogramado');
                        vm.dismiss();
                        modalInstanceBefore.dismiss();
                    }
                } catch (e) {
                    swal("Error", "Ocurrió un error en el servidor", "error");
                }
            },
            OnError: function(Response) {
                vm.loading = false;
                message.apiError(Response);
            }
        });
    };

    function removeShift(shifts) {
        for (var i = shifts.length - 1; i >= 0; i--) {
            if (shifts[i].id == turn_id) {
                shifts.splice(i, 1);
                break;
            }
        }

        return shifts;
    }

    function init() {
        vm.shifts = removeShift(data.shifts);
    }

    init();
});