angular.module('book.filter', [])
    .filter('turnsFilter', function() {
        return function(books, turns) {
            var listBook = [];

            if (turns.length > 0) {
                angular.forEach(books, function(book, key) {
                    if (turns.indexOf(book.turn_id) != -1) {
                        listBook.push(book);
                    }
                });
            } else {
                listBook = books;
            }

            return listBook;
        };
    })
    .filter('sourcesFilter', function() {
        return function(books, sources) {
            var listBook = [];

            if (sources.length > 0) {
                angular.forEach(books, function(book, key) {
                    if (book.reservation !== null) {
                        if (sources.indexOf(book.reservation.source.id) != -1) {
                            listBook.push(book);
                        }
                    }
                });
            } else {
                listBook = books;
            }
            return listBook;
        };
    })
    .filter('zonesFilter', function(BookFactory) {
        return function(books, zones) {
            var listBook = [];

            if (zones.length > 0) {
                angular.forEach(books, function(book, key) {
                    if (book.reservation !== null) {
                        var existsTableZone = BookFactory.existsTablesByZone(book.reservation.tables, zones);
                        if (existsTableZone === true) {
                            listBook.push(book);
                        }
                    }
                });
            } else {
                listBook = books;
            }

            return listBook;
        };
    });