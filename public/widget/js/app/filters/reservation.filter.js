angular.module("App")
    .filter("dateBS", function() {
        return function(date) {
            return moment(date).format("dddd, D [de] MMMM");
        };
    })
    .filter("timeBS", function() {
        return function(hour) {
            return moment(hour, "HH:mm:ss").format("h:mm A");
        };
    });