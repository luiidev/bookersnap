@extends("widget.layouts.mainV2")

@section("title", "Bookersnap | Busqueda")

@section("content")
<div class="params" ng-controller="availabilityCtrl">
    <div id="first" ng-hide="showPrev">
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
            <button type="submit" ng-disabled="!item.availability" ng-bind="item.hour_format" ng-click="saveTemporalReserve(item)"></button>
        </div>

    </div>

    <div id="prevReserve"  ng-show="showPrev">
        <div class="card-body card-padding">
            <div class="bs-body-search">
                <form on-submit="return false;">
                    <div class="card-header prev-reserve">
                        <h2>Tiene una reservación por confirmar</h2>
                        <br/>
                        <span class="btn-block">Fecha y Hora: <strong ng-bind="prevReserve.reservation.datetime_input | fullDateBS"></strong></span>
                        <span class="btn-block">Cantidad: <strong ng-bind="prevReserve.reservation.num_guest + ' Invitados'"></strong></span>
                        <span class="btn-block"> Tiempo para finalizar: <strong><time-down expire="prevReserve.time" on-finish="closePrev()"></time-down></strong></span>
                    </div>
                    <div class="form-group col-xs-12 col-sm-6">
                        <button class="btn btn-default btn-block" ng-click="closePrev()">Cancelar Reservación</button>
                    </div>
                    <div class="form-group col-xs-12 col-sm-6">
                        <button class="btn btn-primary btn-block" ng-click="openPrev()">Continuar Reservación</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="search">
            <div ng-show="case == 1"><button type="submit" ng-click="searchAvailability()">Buscar</button></div>
            <div  ng-show="case == 2"><button type="submit" ng-click="returnSearch()">Regresar</button></div>
        </div>
    </div>
</div>
@endsection