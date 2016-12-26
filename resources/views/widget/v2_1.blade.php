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
                    <div ng-class="{'active bs-bgm': guest.value == selectedPeople.value}" ng-repeat="guest in form.people" ng-bind="guest.text" ng-click="selectPeople(guest)"></div>
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
                                    <span ng-bind="selectedEvent.name"></span>
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
                                <td class="hour-only"  ng-class="{'active  bs-bgm': selectedHour.option == hour.option}" ng-click="selectHour(hour)" ng-bind="hour.option_user"></td>
                            </tr>
                        </table>
                        <table ng-if="hour.events.length">
                            <tr>
                                <td class="hour" rowspan="10" ng-class="{'active  bs-bgm': selectedHour.option == hour.option}" ng-bind="hour.option_user"></td>
                                <td class="promo"  ng-class="{'active  bs-bgm': selectedEvent.id == hour.events[0].id && selectedHour.option == hour.option}" ng-click="selectHour(hour, hour.events[0], 5)" ng-mouseover="promotionDisplay(hour.events[0], $event)" ng-mouseout="promotionHide()">
                                    <span>Evento</span>
                                    <small ng-bind="hour.events[0].description | HtmlToText"></small>
                                </td>
                            </tr>
                            <tr ng-repeat="event in hour.events" ng-if="$index > 0">
                                <td class="promo" ng-class="{'active  bs-bgm': selectedEvent.id == event.id && selectedHour.option == hour.option}" ng-click="selectHour(hour, event)">
                                    <span>Evento</span>
                                    <small ng-bind="event.description | HtmlToText"></small>
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
                    <div ng-class="{'active  bs-bgm': zone.id == selectedZone.id}" ng-repeat="zone in form.zones" ng-bind="zone.option" ng-click="selectZone(zone)"></div>
                </div>
            </div>
        </div>
    </div>

    <div id="two">

        <div class="title" ng-bind="infoAvailability"></div>

        <div  ng-repeat="item in result">
            <button type="submit" class="bsb bsb-block" ng-class="{'bsb-bookersnap bs-bgm': item.hour == availability.hour.option}" ng-disabled="!item.availability" ng-bind="item.hour_format" ng-click="saveTemporalReserve(item)"></button>
        </div>

    </div>

    <div id="prevReserve"  ng-show="showPrev" class="ng-hide">
        <div class="card">
            <div class="card-body card-padding">
                <form on-submit="return false;">
                    <div class="card-header prev-reserve">
                        <h2>Reservación pendiente</h2>
                        <br/>
                        <span class="bsb-block">Fecha y Hora: <strong ng-bind="prevReserve.reservation.datetime_input | fullDateBS"></strong></span>
                        <span class="bsb-block">Cantidad: <strong ng-bind="prevReserve.reservation.num_guest + ' Invitados'"></strong></span>
                        <span class="bsb-block"> Tiempo para finalizar: <strong><time-down expire="prevReserve.time" on-finish="closePrev()"></time-down></strong></span>
                    </div>
                    <div class="form-group">
                        <button class="bsb bsb-block" ng-click="closePrev()">Cancelar Reservación</button>
                    </div>
                    <div class="form-group">
                        <button class="bsb bsb-bookersnap bsb-block bs-bgm" ng-click="openPrev()">Continuar Reservación</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="search">
            <div ng-show="case == 1" class="ng-hide"><button type="submit" class="bsb bsb-block bsb-bookersnap bs-bgm" ng-click="searchAvailability()">Buscar</button></div>
            <div  ng-show="case == 2" class="ng-hide"><button type="submit" class="bsb bsb-block bsb-bookersnap bs-bgm" ng-click="returnSearch()">Regresar</button></div>
        </div>
    </div>

    <div id="event" style="width: 210px; position:absolute; background: #fff; margin-left: 10px;
    -webkit-box-shadow: 0px 7px 15px 0px rgba(0,0,0,0.3);
    -moz-box-shadow: 0px 7px 15px 0px rgba(0,0,0,0.3);
    box-shadow: 0px 7px 15px 0px rgba(0,0,0,0.3);
        " ng-show="promotion.display">
        <div class="bg-image" style="height: 70px;
             background-repeat: no-repeat;
             background-size: 100%;
             " ng-style="{background: promotion.imageUrl}" ng-show="promotion.imageUrl">
        </div>
        <div class="description" style="min-height: 50px;">
                <p style="padding: 10px;
    font-size: 12px;" ng-bind="promotion.description | HtmlToText">promocion 2x1 hasta las 11 p.m, chicas entran gratis hasta las 12 p.m</p>
        </div>
    </div>

</div>
@endsection