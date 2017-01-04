angular.module("notification.app")
    .filter('latamDate', function() {
        return function(date_time) {
            return moment(date_time).format("dddd, D [de] MMM [a las] h:mm A");
        };
    });