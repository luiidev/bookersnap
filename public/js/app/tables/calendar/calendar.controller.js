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
            CalendarService.GetShifts(month, {
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

    .controller('DayShiftController', function (data, $modalInstance, CalendarService, bsLoadingOverlayService) {
        var vm = this;
        vm.date = data.date;

        vm.shifts = {
            breakfast: {id: 1, data: null},
            brunch: {id: 2, data: null},
            lunch: {id: 3, data: null},
            dinner: {id: 4, data: null}
        };

        vm.dismiss = function () {
            $modalInstance.dismiss();
        };

        vm.scheduleBreakfast = function () {

        };

        vm.scheduleBrunch = function () {

        };

        vm.scheduleLunch = function () {

        };

        vm.scheduleDinner = function () {

        };

        function GetData() {
            bsLoadingOverlayService.start();
            CalendarService.GetShiftByDate(vm.date, {
                OnSuccess: function (Response) {
                    bsLoadingOverlayService.stop();
                    var data = Response.data.data;
                    angular.forEach(data, function (item) {
                        var shift = {
                            title: item.title,
                            start: CalendarService.FormatTime(item.date, item.start_time),
                            end: CalendarService.FormatTime(item.date, item.end_time)
                        };
                        switch (item.turn.type_turn.id) {
                            case 1:
                                vm.shifts.breakfast.data = shift;
                                break;
                            case 2:
                                vm.shifts.brunch.data = shift;
                                break;
                            case 3:
                                vm.shifts.lunch.data = shift;
                                break;
                            case 4:
                                vm.shifts.dinner.data = shift;
                                break;
                        }
                    });
                },
                OnError: function (Response) {
                    bsLoadingOverlayService.stop();
                }
            });
        }

        function getMonthNames() {
            return [
                "Enero", "Febrero", "Marzo",
                "Abril", "Mayo", "Junio", "Julio",
                "Agosto", "Setiembre", "Octubre",
                "Noviembre", "Diciembre"
            ];
        }

        function init() {
            var $date = moment(vm.date);

            vm.fulldate = ($date.format("dddd D [de] MMMM [de] YYYY"));

            GetData();
        }

        init();
    });
;