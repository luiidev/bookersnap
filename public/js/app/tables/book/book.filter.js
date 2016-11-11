angular.module('book.filter', [])
    .filter('turnsFilter', function() {
        return function(books, turns) {
            var listBook = [];

            angular.forEach(books, function(book, key) {
                if (turns.length > 0) {
                    if (turns.indexOf(book.turn_id) != -1) {
                        listBook.push(book);
                    }
                } else {
                    listBook.push(book);
                }
            });

            return listBook;
        };
    })
    .filter('sourcesFilter', function() {
        return function(books, sources) {
            var listBook = [];

            angular.forEach(books, function(book, key) {
                if (sources.length > 0) {
                    angular.forEach(book.reservation.data, function(reservation, key) {
                        if (sources.indexOf(reservation.source.id) != -1) {
                            listBook.push(book);
                        }
                    });

                } else {
                    listBook.push(book);
                }

            });

            return listBook;
        };
    });