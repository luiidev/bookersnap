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
    })
    .filter("fullDateBS", function() {
        return function(date_time) {
            return moment(date_time).format("dddd, MMM D YYYY [a las] h:mm A");
        };
    })
    .filter('HtmlToText', function() {
      return function(text) {
        return  text ? String(text).replace(/<[^>]+>/gm, '') : '';
      };
    });