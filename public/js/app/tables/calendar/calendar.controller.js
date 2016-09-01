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
    .controller('CalendarIndexController', function (CalendarIndexService, bsLoadingOverlayService) {
        var vm = this;

        function GetEvents() {
            var month = vm.calendar.fullCalendar('getDate').format('YYYY-MM');
            bsLoadingOverlayService.start();
            CalendarIndexService.GetShifts(month, {
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

        function format_time(str_date, str_hour) {
            // formats a javascript Date object into a 12h AM/PM time string
            var date_obj = new Date(str_date + " " + str_hour);
            var hour = date_obj.getHours();
            var minute = date_obj.getMinutes();
            var amPM = (hour > 11) ? "pm" : "am";
            if (hour > 12) {
                hour -= 12;
            } else if (hour == 0) {
                hour = "12";
            }
            if (minute < 10) {
                minute = "0" + minute;
            }
            return hour + ":" + minute + amPM;
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

                },
                eventClick: function (calEvent, jsEvent, view) {

                },
                viewRender: function (view, element) {
                    GetEvents();
                },

                eventRender: function (event, element) {
                    var $text = '<div class="fc-content" >';
                    $text += '<h5 class="text-center" style="color:white;margin: 2px;white-space: pre-line">' + event.title + '</h5>';
                    $text += '<div class="fc-title text-center">' + format_time(event.date, event.start_time) + ' - ' + format_time(event.date, event.end_time) + '</div>';
                    $text += '</div>';
                    element.html($text);
                }
            });
        }

        function init() {
            initCalendar();
        }

        init();

    });