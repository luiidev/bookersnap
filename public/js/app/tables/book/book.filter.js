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
                    if (book.reservation !== null) {
                        if (sources.indexOf(book.reservation.source.id) != -1) {
                            listBook.push(book);
                        }
                    }
                } else {
                    listBook.push(book);
                }

            });

            return listBook;
        };
    });