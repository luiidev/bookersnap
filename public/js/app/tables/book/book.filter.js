angular.module('book.filter', [])
    .filter('turnsFilter', function(BookFactory) {
        return function(books, turns, bookView) {
            var listBook = [];

            if (turns.length > 0 && bookView === false) {
                angular.forEach(books, function(book, key) {
                    if (turns.indexOf(book.turn_id) != -1) {
                        listBook.push(book);
                    }
                });
            } else {
                listBook = books;
            }

            if (bookView === false) {
                BookFactory.getResumenBook(listBook);
            }

            return listBook;
        };
    })
    .filter('numGuestFilter', function(BookFactory) {
        return function(books, numGuest, bookView) {
            var listBook = [];

            if (bookView === false) {
                angular.forEach(books, function(book, key) {
                    if (book.tables.length > 0) {
                        var numGuestsValidate = 0;

                        angular.forEach(book.tables, function(table, key) {
                            if (numGuest >= table.min_cover && numGuest <= table.max_cover) {
                                numGuestsValidate += 1;
                            }
                        });

                        books[key].available = (numGuestsValidate > 0) ? true : false;
                    }
                });
                listBook = books;
            } else {
                listBook = books;
            }

            // BookFactory.getResumenBook(listBook);

            return listBook;
        };
    })
    .filter('sourcesFilter', function(BookFactory) {
        return function(books, sources, bookView) {
            var listBook = [];

            if (sources.length > 0 && bookView === false) {
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

            if (bookView === false) {
                BookFactory.getResumenBook(listBook);
            }

            return listBook;
        };
    })
    .filter('zonesFilter', function(BookFactory) {
        return function(books, zones, bookView) {
            var listBook = [];

            if (zones.length > 0 && bookView === false) {
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

            if (bookView === false) {
                BookFactory.getResumenBook(listBook);
            }

            return listBook;
        };
    });