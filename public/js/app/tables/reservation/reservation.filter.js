angular.module("reservation.filter", [])
.filter("zoneFilter", function() {
    return function(list, filter) {
        return list.filter(function(item) {
            return filter.indexOf(item.id) !== -1;
        });
    }
});