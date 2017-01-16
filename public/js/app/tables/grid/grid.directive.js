angular.module('grid.directive', [])
    .directive('hoverReservationGrid', function() {
        return {
            restrict: 'A',
            link: function(scope, element, attr) {
                var zIndex = 0;
                element.on('mouseover', function(event) {
                    event.preventDefault();
                    zIndex = element.attr('z-index');
                    angular.element(this).parent().parent().css('z-index', 120);
                });
                element.on('mouseout', function(event) {
                    event.preventDefault();
                    angular.element(this).parent().parent().css('z-index', zIndex);
                    //console.log("mouseout", zIndex);
                });
            }
        };
    })
    .directive('dragReservaGrid', function() {
        return {
            restrict: 'A',
            scope: {
                reservaSelected: "=",
                reservation: "=",
                dragPosition: "=",
                onDragEnd: "&",
                itemSelected: "=",
                tableSelected: "=",
                conflicts: "=",
                conflictsIni: "="
            },
            link: function(scope, element, attr) {

                element.draggable({
                    //containment: ".grid-body",
                    grid: [62, 63],
                    cursor: "move",
                    drag: function(event, ui) {
                        //console.log("dragReservaGrid");
                    },
                    start: function(event, ui) {
                        element.css("transform", "none");
                        element.css("opacity", "0.6");
                        element.css("z-index", "1");

                        scope.$apply(function() {
                            scope.reservaSelected = scope.reservation;
                            scope.tableSelected = scope.itemSelected.id;
                        });
                    },
                    stop: function(event, ui) {
                        element.css("opacity", "1");
                        scope.$apply(function() {
                            scope.dragPosition = ui.position;
                        });

                        scope.onDragEnd();
                    }
                });

                if (scope.conflicts === false || scope.conflictsIni === true) {
                    element.draggable('enable');
                } else {
                    element.draggable('disable');
                }
            }
        };
    })
    .directive('dropReservaGrid', function() {
        return {
            restrict: 'A',
            scope: {
                grid: "=",
            },
            link: function(scope, element, attr) {

                element.droppable({
                    drop: function(event, ui) {
                        //console.log("drop", angular.toJson(scope.grid, true));
                    }
                });
            }
        };
    })
    .directive('dragBlockGrid', function() {
        return {
            restrict: 'A',
            scope: {
                block: "=",
                blockSelected: "=",
                itemSelected: "=",
                tableSelected: "=",
                endBlockDrag: "&",
                dragPosition: "="
            },
            link: function(scope, element, attr) {

                element.draggable({
                    //containment: ".grid-body",
                    grid: [62, 63],
                    cursor: "move",
                    drag: function(event, ui) {
                        //console.log("dragReservaGrid");
                    },
                    start: function(event, ui) {
                        element.css("transform", "none");
                        element.css("opacity", "0.6");

                        scope.$apply(function() {
                            scope.blockSelected = scope.block;
                            scope.tableSelected = scope.itemSelected.id;
                            console.log("start drag");
                        });
                    },
                    stop: function(event, ui) {
                        element.css("opacity", "1");
                        scope.$apply(function() {
                            scope.dragPosition = ui.position;
                        });
                        scope.endBlockDrag();
                    }
                });
            }
        };
    })
    .directive('dropReservaGridMaster', function() {
        return {
            restrict: 'A',
            scope: {
                grid: "=",
                table: "=",
                tableBlock: "="
            },
            link: function(scope, element, attr) {

                element.droppable({
                    drop: function(event, ui) {
                        scope.$apply(function() {
                            scope.table = scope.grid.id;
                            scope.tableBlock = scope.grid.id;
                        });
                        //console.log("drop", angular.toJson(scope.grid.name, true));
                    }
                });
            }
        };
    })
    .directive('resizeGridReservation', function() {
        return {
            restrict: 'A',
            link: function(scope, element, attr) {
                element.resizable({
                    grid: [62, 63],
                    handles: 'e',
                    resize: function(event, ui) {
                        console.log("resize");
                    }
                });
            }
        };
    })
    .directive('currentTime', function() {
        return {
            restrict: 'E',
            scope: {
                leftTime: "=",
                time: "=",
                turn: "=",
                updateTime: "&",
                visibility: "@"
            },
            template: '<div class="grid-current-time-marker" id="grid-current-time-marker" ng-style="{left:leftTime,visibility :visibility}">' +
                '<div class="grid-current-time-label">' +
                '{{time}}</div></div>',
            link: function(scope, element, attr) {
                //console.log("currentTime", angular.toJson(scope.turn, true), scope.leftTime);
                var minutesData = calculateMinutesIni(scope.turn);
                var hourNow = moment().format("HH:mm A");
                var dateNow = moment().format("YYYY-MM-DD");

                scope.leftTime = minutesData.leftTime + "px";
                scope.time = hourNow;

                var intervalTimeDirective = null;

                var updateTime = function() {
                    scope.$apply(function() {
                        scope.leftTime = intervalTime(scope.leftTime);
                        hourNow = moment().format("HH:mm A");
                        scope.time = hourNow;

                        if (moment(dateNow + " " + hourNow).isSameOrAfter(dateNow + " " + scope.turn.turn.hours_end)) {
                            scope.visibility = 'hidden';
                            clearInterval(intervalTimeDirective);
                        }

                        scope.updateTime();
                    });
                };

                if (moment(dateNow + " " + scope.turn.turn.hours_end).isSameOrBefore(dateNow + " " + hourNow)) {
                    scope.visibility = 'hidden';
                } else {
                    setTimeout(function() {
                        updateTime();
                        intervalTimeDirective = setInterval(function() {
                            updateTime();
                        }, 60000);
                    }, minutesData.miliseconds);
                }
            }
        };

        function calculateMinutesIni(turn) {
            var data = {};

            var hourIni = moment().format("HH:mm:ss");
            var dateNow = moment().format("YYYY-MM-DD");
            var hourEnd = turn.turn.hours_ini;
            var minutes = moment(dateNow + " " + hourEnd).format("mm");
            var hours = moment(dateNow + " " + hourEnd).format("HH");
            var duration = moment(dateNow + " " + hourIni).subtract('minutes', minutes).subtract('hours', hours).format("HH:mm:ss");

            var minutesTotal = calculateMinutesTime(dateNow + " " + duration);
            var miliseconds = (60 - moment().format("ss")) * 1000;
            var leftTime = minutesTotal * 4.1333 + (62);
            data = {
                leftTime: leftTime,
                minutes: minutesTotal,
                miliseconds: miliseconds,
                seconds: moment().format("ss")
            };

            //console.log("calculateMinutesIni", angular.toJson(data, true));
            return data;
        }

        function intervalTime(leftTime) {
            var onlyNumber = parseInt(leftTime.replace("px", ""));
            onlyNumber += 4.1333;
            leftTime = onlyNumber + "px";
            return leftTime;
        }
    })
    .directive('scrollGridBody', function() {
        return {
            restrict: 'A',
            link: function(scope, element, attr) {
                var oldScrollTop = $(element).scrollTop();
                var oldScrollLeft = $(element).scrollLeft();
                var marginLeft = null;
                var typeScroll = "";

                angular.element("body").css("overflow-y", "hidden");

                element.scroll(function() {
                    typeScroll = ($(this).scrollTop() === 0) ? "horizontal" : "vertical";
                    if (oldScrollTop == $(this).scrollTop()) {
                        typeScroll = "horizontal";
                    } else {
                        typeScroll = "vertical";
                    }

                    oldScrollTop = $(element).scrollTop();
                    oldScrollLeft = $(element).scrollLeft();

                    if (typeScroll === "horizontal") {
                        angular.element("#grid-time-label-out").css("margin-left", -$(this).scrollLeft());
                        angular.element("#grid-current-time-marker").css("margin-left", -$(this).scrollLeft());
                    } else {
                        angular.element("#grid-column-tables-inner").css("margin-top", -$(this).scrollTop());
                    }
                });
            }
        };
    });