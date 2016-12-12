angular.module("block.filter", [])
    .filter("blockHour", [function() {
        return function(list, start, end) {
            if (!start) {
                return list;
            }

            var salida = [];
            var index = 0;
            
            for (var i = 0; i < list.length; i++) {
                if (list[i].hour24 == start.hour24) {
                    index = i;
                    break;
                }
            }

            index = index > 0 ? index+1 : index;
            for (var x = index; x < list.length; x++) {
                salida.push(list[x]);
            }

            return salida;
        };
    }]);