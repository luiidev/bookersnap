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
                    <div>
                        <table>
                            <tr>
                                <td class="hour" ng-bind="selectedHour.option_user" style="width: 70px; padding: 0 5px"></td>
                                <td class="promo">
                                    <h4 ng-bind="selectedEvent.name" style="width: 70px; padding: 0 5px"></h4>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
                <div class="body">
                    <div class="promo-list">

                        <div class="item" ng-repeat="hour in form.hours">
                            <table ng-if="!hour.events || hour.events.length == 0">
                                <tr>
                                    <td class="hour-only" ng-click="selectHour(hour)" ng-bind="hour.option_user"></td>
                                </tr>
                            </table>
                            <table ng-if="hour.events.length">
                                <tr>
                                    <td class="hour" rowspan="4" ng-bind="hour.option_user"></td>
                                    <td class="promo" ng-click="selectHour(hour, hour.events[0])">
                                        <h4 ng-bind="hour.events[0].name"></h4>
                                        <small ng-bind="hour.events[0].description"></small>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="promo" ng-repeat="event in hour.events" ng-if="$index > 0" ng-click="selectHour(hour, event)">
                                        <h4 ng-bind="event.name"></h4>
                                        <small ng-bind="event.description"></small>
                                    </td>
                                </tr>
                            </table>
                        </div>

                    </div>
                </div>
            </div>
            <div class="row">
                <div class="header">
                    <div ng-bind="selectedZone.option">Terraza</div>
                </div>
                <div class="body">
                    <div class="select">
                        <div ng-class="{active: zone.id == selectedZone.id}" ng-repeat="zone in form.zones" ng-bind="zone.option" ng-click="selectZone(zone)"></div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="search">
                    <div><button type="submit">Buscar</button></div>
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