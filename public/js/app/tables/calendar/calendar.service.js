/**
 * Created by BS on 25/08/2016.
 */

angular.module('calendar.service', [])

    .service('CalendarService', function ($http) {
        //var url_api_mesas = 'http://api-mesas.vh/v1/es';
        var url_api_mesas = 'http://localhost:3004/v1/es';
        return {
            FormatTime: function (str_date, str_hour) {
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
            },
            GetShifts: function ($month, $listener) {
                $http.get(url_api_mesas + '/microsites/1/calendar/' + $month, null).then($listener.OnSuccess, $listener.OnError);
            },
            GetShiftByDate: function ($date, $listener) {
                $http.get(url_api_mesas + '/microsites/1/calendar/' + $date, null).then($listener.OnSuccess, $listener.OnError);
            }
        };
    })
