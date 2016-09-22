/**
 * Created by BS on 25/08/2016.
 */

angular.module('calendar.controller', ['bsLoadingOverlay'])
    .run(function (bsLoadingOverlayService) {
        bsLoadingOverlayService.setGlobalConfig({
            delay: 0, // Minimal delay to hide loading overlay in ms.
            activeClass: undefined, // Class that is added to the element where bs-loading-overlay is applied when the overlay is active.
            templateUrl: 'overlay-template.html', // Template url for overlay element. If not specified - no overlay element is created.
            templateOptions: undefined // Options that are passed to overlay template (specified by templateUrl option above).
        });
    })
    //-----------------------------------------------
    // CALENDAR CONTROLLER
    //-----------------------------------------------
    .controller('CalendarIndexController', function (CalendarService, bsLoadingOverlayService, $modal) {
        var vm = this;

        var now;

        function GetEvents() {
            var month = vm.calendar.fullCalendar('getDate').format('YYYY-MM');
            bsLoadingOverlayService.start();
            CalendarService.GetShiftsByMonth(month, {
                OnSuccess: function (Response) {
                    bsLoadingOverlayService.stop();
                    vm.events = Response.data.data;
                    updateCalendar();
                },
                OnError: function (Response) {
                    bsLoadingOverlayService.stop();
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
                    left: ''
                },
                theme: true,
                selectable: true,
                selectHelper: true,
                //editable: true,
                events: vm.events,
                eventOrder: 'start_time',
                select: function (start, end, allDay) {
                    //alert(4545)
                },
                eventClick: function (calEvent, jsEvent, view) {
                    OpenDay(calEvent.date);
                    //console.log(calEvent.date);
                },
                dayClick: function (date, jsEvent, view) {
                    var $date = date.format('YYYY-MM-DD');
                    OpenDay($date);
                },
                viewRender: function (view, element) {
                    GetEvents();
                },
                eventRender: function (event, element) {
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
        }

        function OpenDay($date) {
            if (CalendarService.isBefore($date, now)) {
                return false;
            }

            var modalInstance = $modal.open({
                templateUrl: 'addEvent.html',
                controller: 'DayShiftController',
                controllerAs: 'vm',
                backdrop: 'static',
                keyboard: false,
                resolve: {
                    data: function () {
                        return {
                            date: $date,
                            GetEvents: function () {
                                GetEvents();
                            }
                        };
                    }
                }
            });
        }

        function DateNow() {
            now = moment();
            now.set({ 'hour': 0,
                'minute': 0,
                'second': 0,
                'millisecond': 0
            });
        }

        function init() {
            DateNow();
            initCalendar();
        }

        init();

    })

    .controller('DayShiftController', function (data, $modalInstance, CalendarService, bsLoadingOverlayService, $modal) {
        var vm = this;
        vm.date = data.date;
        vm.flags = {isLoading: false};

        vm.shifts = [];

        vm.dismiss = function () {
            $modalInstance.dismiss();
        };

        vm.AddSchedule = function (type_shift_id, $name) {
            openDialogShedule(type_shift_id, $name);
        };

        vm.removeSchedule = function (id) {
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
            }, function (isConfirm) {
                if (isConfirm) {
                    bsLoadingOverlayService.start();
                    CalendarService.DeleteShift(id, vm.date, {
                        OnSuccess: function (Response) {
                            bsLoadingOverlayService.stop();
                            GetData();
                            data.GetEvents();
                            vm.dismiss();
                        },
                        OnError: function (Response) {
                            bsLoadingOverlayService.stop();
                            message.apiError(Response);
                        }
                    });
                }
            });
        };
        
        function GetData() {
            bsLoadingOverlayService.start();
            CalendarService.GetShiftByDate(vm.date, {
                OnSuccess: function (Response) {
                    bsLoadingOverlayService.stop();
                    vm.shifts = Response.data.data;
                },
                OnError: function (Response) {
                    bsLoadingOverlayService.stop();
                }
            });
        }

        function openDialogShedule(type_shift_id, $name) {
            vm.flags.isLoading = true;
            CalendarService.GetShiftsByType(type_shift_id, {
                OnSuccess: function (Response) {
                    vm.flags.isLoading = false;
                    try {
                        var $type_shift = {id: type_shift_id, name: $name};
                        var modalInstance = $modal.open({
                            templateUrl: 'schedule.html',
                            controller: 'ScheduleShiftController',
                            controllerAs: 'vm',
                            backdrop: 'static',
                            keyboard: false,
                            resolve: {
                                data: function () {
                                    return {
                                        modalInstance: $modalInstance,
                                        typeShift: $type_shift,
                                        date: vm.date,
                                        shifts: Response.data.data,
                                        updateShifts: function () {
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
                OnError: function (Response) {
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

        vm.changeSchedule = function (type_shift_id, $name, turn_id) {
            openDialogChangeShedule(type_shift_id, $name, turn_id);
        };

        function openDialogChangeShedule(type_shift_id, $name, turn_id) {
            vm.flags.isLoading = true;
            CalendarService.GetShiftsByType(type_shift_id, {
                OnSuccess: function (Response) {
                    vm.flags.isLoading = false;
                    try {
                        var $type_shift = {id: type_shift_id, name: $name};
                        var modalInstance = $modal.open({
                            templateUrl: 'changeSchedule.html',
                            controller: 'ScheduleChangeController',
                            controllerAs: 'vm',
                            backdrop: 'static',
                            keyboard: false,
                            resolve: {
                                data: function () {
                                    return {
                                        modalInstance: $modalInstance,
                                        turn_id: turn_id,
                                        typeShift: $type_shift,
                                        date: vm.date,
                                        shifts: Response.data.data,
                                        updateShifts: function () {
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
                OnError: function (Response) {
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

    .controller('ScheduleShiftController', function (data, $modalInstance, CalendarService) {
        var vm = this;
        vm.typeShift = data.typeShift;
        vm.shifts = data.shifts;
        vm.date = data.date;
        vm.flags = {isLoading: false};
        var modalInstanceBefore = data.modalInstance;

        vm.dismiss = function () {
            $modalInstance.dismiss();
        };

        vm.am_pm = function (time) {
            return CalendarService.FormatTime(vm.date, time);
        };

        vm.schedule = function (shift_id) {
            vm.flags.isLoading = true;
            CalendarService.ScheduleShift(shift_id, vm.date, {
                OnSuccess: function (Response) {
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
                OnError: function (Response) {
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
            CalendarService.SetCalendarLocale();
            var $moment = moment(vm.date);
            vm.formatted_date = $moment.format('MMMM DD');
            vm.day_name = $moment.format('dddd') + ($moment.day() == 6 || $moment.day() == 0 ? 's' : '');
        }

        init();
    })

    .controller('ScheduleChangeController', function (data, $modalInstance, CalendarService) {
        var vm = this;
        vm.typeShift = data.typeShift;
        vm.date = data.date;
        vm.flags = {isLoading: false};
        var turn_id = data.turn_id;
        var modalInstanceBefore = data.modalInstance;

        vm.dismiss = function () {
            $modalInstance.dismiss();
        };

        vm.am_pm = function (time) {
            return CalendarService.FormatTime(vm.date, time);
        };

        vm.changeCheduless = function (shift_id) {
            vm.flags.isLoading = true;
            CalendarService.ChangeSchedule(turn_id, shift_id, vm.date, {
                OnSuccess: function (Response) {
                    vm.flags.isLoading = false;
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
                OnError: function (Response) {
                    vm.flags.isLoading = false;
                    message.apiError(Response);
                }
            });
        };

        function removeShift(shifts){
               for (var i = shifts.length - 1; i >= 0; i--) {
                    if (shifts[i].id == turn_id) {
                        shifts.splice(i, 1);
                        break;
                    }
               }

               return shifts;
        }

        function init() {
            vm.shifts =  removeShift(data.shifts);
        }

        init();
    });
