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
                <uib-datepicker class="calendar" ng-model="date" min-date="minDate" max-mode="day" show-weeks="false" starting-day="1" date-disabled="disabled(date, mode)" mchange="monthChange()" month-changed="changeMonth($date, $month, $year, $instance, $select)"></uib-datepicker>
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
                                    <span ng-bind="(selectedEvent.name).substring(0,18)"></span>
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
                            <tr ng-class="{'b-b-0': $index ==  form.hours.length -1}">
                                <td class="hour-only"  ng-class="{'active  bs-bgm': selectedHour.option == hour.option}" ng-click="selectHour(hour)" ng-bind="hour.option_user"></td>
                            </tr>
                        </table>
                        <table ng-if="hour.events.length">
                            <!-- ng-mouseover="promotionDisplay(hour.events[0], $event)" ng-mouseout="promotionHide()" -->
                            <tr ng-class="{'b-b-0': ($index ==  form.hours.length -1) && $index > 5 &&  hour.events.length == 1}">
                                <td class="hour" rowspan="10" ng-class="{'active  bs-bgm': selectedHour.option == hour.option}" ng-bind="hour.option_user"></td>
                                <td class="promo"  ng-class="{'active  bs-bgm': selectedEvent.id == hour.events[0].id && selectedHour.option == hour.option}" ng-click="selectHour(hour, hour.events[0], 5)" >
                                    <span  ng-hide="selectedEvent.id == hour.events[0].id && selectedHour.option == hour.option" ng-bind="hour.events[0].name_type"></span>
                                    <small ng-hide="selectedEvent.id == hour.events[0].id && selectedHour.option == hour.option" ng-bind="(hour.events[0].description | HtmlToText).substring(0,24)"></small>
                                    <div ng-show="selectedEvent.id == hour.events[0].id && selectedHour.option == hour.option">
                                        <div class="bg-image" ng-style="{'background-image': 'url('+ hour.events[0].image_thumb + ')'}"></div>
                                        <div class="description">
                                            <p style="" ng-bind="hour.events[0].description | HtmlToText"></p>
                                        </div>
                                    </div> 
                                </td>
                            </tr>
                            <tr ng-class="{'b-b-0': ($index ==  form.hours.length -1) && $index > 5 &&  hour.events.length > 1}" ng-repeat="event in hour.events" ng-if="$index > 0">
                                <td class="promo" ng-class="{'active  bs-bgm': selectedEvent.id == event.id && selectedHour.option == hour.option}" ng-click="selectHour(hour, event)" >
                                    <span ng-hide="selectedEvent.id == event.id  && selectedHour.option == hour.option" ng-bind="event.name_type"></span>
                                    <small ng-hide="selectedEvent.id == event.id  && selectedHour.option == hour.option" ng-bind="(event.description | HtmlToText).substring(0,24)"></small>
                                    <div ng-show="selectedEvent.id == event.id  && selectedHour.option == hour.option">                                    
                                        <div class="bg-image" ng-style="{'background-image': 'url('+ event.image_thumb + ')'}"></div>
                                        <div class="description">
                                            <p style="" ng-bind="event.description | HtmlToText"></p>
                                        </div>
                                    </div> 
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
            <button type="submit" class="bsb bsb-block" ng-class="{'bsb-bookersnap bs-bgm': item.hour == availability.hour}" ng-disabled="!item.availability" ng-bind="item.hour_format" ng-click="saveTemporalReserve(item)"></button>
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

    <div id="event" class="ng-hide" ng-show="promotion.display">
        <div class="bg-image" ng-style="{background: promotion.imageUrl}" ng-show="promotion.imageUrl">
        </div>
        <div class="description">
            <p style="" ng-bind="promotion.description | HtmlToText"></p>
        </div>
    </div>

</div>
@endsection