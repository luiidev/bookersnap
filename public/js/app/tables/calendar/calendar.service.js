/**
 * Created by BS on 25/08/2016.
 */

angular.module('calendar.service', [])

    .service('CalendarIndexService', function ($http) {
        var url_api_mesas = 'http://api-mesas.vh/v1/es';
        return {
            GetShifts: function ($month, $listener) {
                $http.get(url_api_mesas + '/microsites/1/calendar/' + $month, null).then($listener.OnSuccess, $listener.OnError);
            }
        };
    });