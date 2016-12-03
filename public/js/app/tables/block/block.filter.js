angular.module("block.filter", [])
    .filter("blockHour", [function() {
        return function(list, start, end) {
            if (!start) {
                return list;
            }

            var salida = [];
            end = end || {};
            var index = 0;
            var end_index;
            for (var i = 0; i < list.length; i++) {
                if (list[i].hour24 == start.hour24) {
                    index = i;
                }
                if (list[i].hour24 == end.hour24) {
                    index = i;
                }
            }

            for (var x = index; x < list.length; x++) {
                salida.push(list[x]);
            }
            console.log(end);
            end = null;
            return salida;
        };
    }]);