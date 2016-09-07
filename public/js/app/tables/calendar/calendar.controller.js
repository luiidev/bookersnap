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
                    //console.log();

                    //alert('Coordinates: ' + jsEvent.pageX + ',' + jsEvent.pageY);

                    //alert('Current view: ' + view.name);

                    // change the day's background color just for fun
                    //$(this).css('background-color', 'red');

                },
                viewRender: function (view, element) {
                    GetEvents();
                },

                eventRender: function (event, element) {
                    var $text = '<div class="fc-content" >';
                    $text += '<h5 class="text-center" style="color:white;margin: 2px;white-space: pre-line">' + event.title + '</h5>';
                    $text += '<div class="fc-title text-center">' + CalendarService.FormatTime(event.date, event.start_time) + ' - ' + CalendarService.FormatTime(event.date, event.end_time) + '</div>';
                    $text += '</div>';
                    element.html($text);
                }
            });
        }

        function OpenDay($date) {
            var modalInstance = $modal.open({
                templateUrl: 'addEvent.html',
                controller: 'DayShiftController',
                controllerAs: 'vm',
                backdrop: 'static',
                keyboard: false,
                resolve: {
                    data: function () {
                        return {
                            date: $date
                        };
                    }
                }
            });
        }

        function init() {
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
            openDialogShedule(type_shift_id, $name)
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
                                        typeShift: $type_shift,
                                        date: vm.date,
                                        shifts: Response.data.data
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
        vm.scheduleOption = 0;
        vm.shifts = data.shifts;
        vm.date = data.date;
        vm.flags = {isLoading: false};

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
                        if (Response.data.statuscode == 200) {
                            $modalInstance.dismiss();
                            messageAlert('Rol actualizado', '', 'success');
                        }
                    } catch (e) {
                        swal("Error", "Ocurrió un error en el servidor", "error");
                    }
                },
                OnError: function (Response) {
                    vm.flags.isLoading = false;
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
    });
