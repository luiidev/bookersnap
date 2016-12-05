angular.module("reservation.filter", [])
.filter("zoneFilter", function() {
    return function(list, filter) {
        console.log(filter);
        return list;
    }
});