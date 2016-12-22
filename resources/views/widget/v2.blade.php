<!DOCTYPE html>
<html>
<head>
    <title>Widget V2</title>
    <link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/themes/smoothness/jquery-ui.css">
    <link rel="stylesheet" type="text/css" href="{{ asset('widget/css/style2.css') }}">
    <meta charset="utf-8">
</head>
<body ng-app="App">
    <div class="content">
        <div class="params" ng-controller="availabilityCtrl">
            <div id="first">
                <div class="row">
                    <div class="header b-top">
                        <div ng-bind="infoDate"></div>
                    </div>
                    <div class="body active">
                        <uib-datepicker class="calendar" ng-model="date" min-date="minDate"  show-weeks="false" starting-day="1" date-disabled="disabled(date, mode)"/></uib-datepicker>
                    </div>
                </div>
                <div class="row">
                    <div class="header">
                        <div ng-bind="selectedPeople.text"></div>
                    </div>
                    <div class="body">
                        <div class="select">
                            <div ng-class="{active: guest.value == selectedPeople.value}" ng-repeat="guest in form.people" ng-bind="guest.text" ng-click="selectPeople(guest)"></div>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="header">
                        <div ng-bind="selectedHour.option_user" ng-if="!selectedEvent.name"></div>
                        <div ng-if="selectedEvent.name">
                            <div class="hour-select">
                                <table>
                                    <tr>
                                        <td class="hour pull-left" ng-bind="selectedHour.option_user"></td>
                                        <td class="promo pull-right">
                                            <h4 ng-bind="selectedEvent.name"></h4>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div class="body">
                        <div class="promo-list">

                            <div class="item" ng-repeat="hour in form.hours">
                                <table ng-if="!hour.events || hour.events.length == 0">
                                    <tr>
                                        <td class="hour-only"  ng-class="{active: selectedHour.option == hour.option}" ng-click="selectHour(hour)" ng-bind="hour.option_user"></td>
                                    </tr>
                                </table>
                                <table ng-if="hour.events.length">
                                    <tr>
                                        <td class="hour" rowspan="10" ng-class="{active: selectedHour.option == hour.option}" ng-bind="hour.option_user"></td>
                                        <td class="promo"  ng-class="{active: selectedEvent.id == hour.events[0].id && selectedHour.option == hour.option}" ng-click="selectHour(hour, hour.events[0], 5)">
                                            <h4 ng-bind="hour.events[0].name"></h4>
                                            <small ng-bind="hour.events[0].description"></small>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="promo" ng-class="{active: selectedEvent.id == event.id && selectedHour.option == hour.option}" ng-repeat="event in hour.events" ng-if="$index > 0" ng-click="selectHour(hour, event)">
                                            <h4 ng-bind="event.name"></h4>
                                            <small ng-bind="event.description"></small>
                                        </td>
                                    </tr>
                                </table>
                            </div>

                        </div>
                    </div>
                </div>
                <div class="row" ng-click="zoneColapse($event)">
                    <div class="header">
                        <div ng-bind="selectedZone.option"></div>
                    </div>
                    <div class="body">
                        <div class="select">
                            <div ng-class="{active: zone.id == selectedZone.id}" ng-repeat="zone in form.zones" ng-bind="zone.option" ng-click="selectZone(zone)"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div id="two">

                <div class="title" ng-bind="infoAvailability"></div>

                <div  ng-repeat="item in result">
                    <button type="submit" ng-disabled="!item.availability" ng-bind="item.hour_format">10:30 AM</button>
                </div>

            </div>

            <div class="row">
                <div class="search">
                    <div ng-show="case == 1"><button type="submit" ng-click="searchAvailability()">Buscar</button></div>
                    <div  ng-show="case == 2"><button type="submit" ng-click="returnSearch()">Regresar</button></div>
                </div>
            </div>
        </div>
    </div>

    <!-- Library Content  End-->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
    <script type="text/javascript" src="{{ asset('widget/library/angular/angular.min.js') }}"></script>
    <script type="text/javascript" src="{{ asset('widget/library/angular-locale/angular-locale_es-mx.min.js') }}"></script>
    <script type="text/javascript" src="{{ asset('widget/library/angular-bootstrap/ui-bootstrap-tpls.min.js') }}"></script>
    <script type="text/javascript" src="{{ asset('widget/library/moment/min/moment.min.js') }}"></script>
    <script type="text/javascript" src="{{ asset('widget/library/moment/locale/es.js') }}"></script>
    <!-- Library Content  End-->

    <script type="text/javascript" src="{{ asset('widget/js/app2/app.js') }}"></script>
    <script type="text/javascript" src="{{ asset('widget/js/app2/controllers/availability.controller.js') }}"></script>
    <script type="text/javascript" src="{{ asset('widget/js/app2/services/availability.service.js') }}"></script>

    <script src="{{ asset('widget/js/functions.js') }}"></script>

</body>
</html>