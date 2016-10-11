/**
 * Created by BS on 25/08/2016.
 */

angular.module('calendar.service', [])

.service('CalendarService', function($http, ApiUrlMesas) {
    return {
        FormatTime: function(str_date, str_hour) {
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
        isBefore: function(date, now) {
            var dateCalendar = moment(date);
            return moment(dateCalendar).isBefore(now);
        },
        GetShiftsByMonth: function($month, $listener) {
            $http.get(ApiUrlMesas + '/calendar/' + $month, null).then($listener.OnSuccess, $listener.OnError);
        },
        GetShiftByDate: function($date, $listener) {
            $http.get(ApiUrlMesas + '/calendar/' + $date + '/shifts', null).then($listener.OnSuccess, $listener.OnError);
        },
        GetShiftsByType: function(id, $listener) {
            $http.get(ApiUrlMesas + '/turns?type_turn=' + id, null).then($listener.OnSuccess, $listener.OnError);
            //var $res = {};
            //var $response = [
            //    {id: 1, name: 'Turno D1', hours_ini: '07:00:00', hours_end: '10:00:00'},
            //    {id: 2, name: 'Turno D2', hours_ini: '08:00:00', hours_end: '11:00:00'},
            //    {id: 3, name: 'Turno D3', hours_ini: '09:00:00', hours_end: '12:00:00'},
            //    {id: 4, name: 'Turno D4', hours_ini: '09:00:00', hours_end: '12:00:00'},
            //    {id: 5, name: 'Turno D5', hours_ini: '09:00:00', hours_end: '12:00:00'},
            //    {id: 6, name: 'Turno D6', hours_ini: '09:00:00', hours_end: '12:00:00'},
            //    {id: 7, name: 'Turno D7', hours_ini: '09:00:00', hours_end: '12:00:00'},
            //    {id: 8, name: 'Turno D8', hours_ini: '09:00:00', hours_end: '12:00:00'},
            //    {id: 9, name: 'Turno D9', hours_ini: '09:00:00', hours_end: '12:00:00'},
            //    {id: 10, name: 'Turno D10', hours_ini: '09:00:00', hours_end: '12:00:00'},
            //    {id: 11, name: 'Turno D11', hours_ini: '09:00:00', hours_end: '12:00:00'},
            //    {id: 12, name: 'Turno D12', hours_ini: '09:00:00', hours_end: '12:00:00'},
            //    {id: 13, name: 'Turno D13', hours_ini: '09:00:00', hours_end: '12:00:00'},
            //    {id: 14, name: 'Turno D14', hours_ini: '09:00:00', hours_end: '12:00:00'},
            //    {id: 15, name: 'Turno D15', hours_ini: '09:00:00', hours_end: '12:00:00'},
            //    {id: 16, name: 'Turno D16', hours_ini: '09:00:00', hours_end: '12:00:00'},
            //    {id: 17, name: 'Turno D17', hours_ini: '09:00:00', hours_end: '12:00:00'}
            //];
            //
            //$res.data = $response;
            //
            //$listener.OnSuccess($res);
        },
        GetTypeShiftById: function(id) {
            var $name = null;
            switch (id) {
                case 1:
                    $name = 'Desayuno';
                    break;
                case 2:
                    $name = 'Brunch';
                    break;
                case 3:
                    $name = 'Almuerzo';
                    break;
                case 4:
                    $name = 'Cena';
                    break;

            }
            return {
                id: id,
                name: $name
            };
        },
        ScheduleShift: function(id, date, $listener) {
            $http.post(ApiUrlMesas + '/calendar', {
                res_turn_id: id,
                date: date
            }).then($listener.OnSuccess, $listener.OnError);
            //$listener.OnSuccess({data: {statuscode: 200}, status: 200});
        },

        DeleteShift: function(id, date, $listener) {
            $http.delete(ApiUrlMesas + '/calendar/' + id, {
                params: {
                    date: date
                }
            }).
            then($listener.OnSuccess, $listener.OnError);
        },

        ChangeSchedule: function(turn_id, shift_id, date, $listener) {
            $http.put(ApiUrlMesas + '/calendar/change', {
                turn_id: turn_id,
                shift_id: shift_id,
                date: date
            }).then($listener.OnSuccess, $listener.OnError);
        },
    };
});