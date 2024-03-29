@extends('widget.layouts.main')

@section("title", "Paramontino | Busqueda")

@section("content")
<div class="card" ng-controller="availabilityCtrl">
    <div class="card-header hidden-xs">
        <h2>Paramontino<small>100 Queen St W, Toronto, ON M5H 2N2</small></h2>
    </div>

    <div class="card-body card-padding">
        <div class="card-body card-padding" ng-show="showPrev">
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

        <div ng-hide="showPrev">
            <div class="card-body card-padding">
                <div class="bs-body-search">
                    <form>
                        <div class="form-group col-xs-12 col-sm-6 col-md-3">
                            <input class="form-control"  type="text" is-open="opened" ng-click="opened = !opened" ng-model="date" placeholder="Fecha" uib-datepicker-popup="dd-MM-yyyy" datepicker-options="dateOptions" clear-text="" close-text="Cerrar" current-text="Hoy" date-disabled="disabled(date, mode)"/>
                        </div>
                        <div class="form-group col-xs-12 col-sm-6 col-md-3">
                            <select class="form-control" ng-change="searchAvailability()" ng-options="hour as hour.option_user for hour in form.hours" ng-model="availability.hour"></select>
                        </div>
                        <div class="form-group col-xs-12 col-sm-6 col-md-3">
                            <select class="form-control" ng-change="searchAvailability()" ng-options="guest.value as guest.text for guest in form.people" ng-model="availability.num_guests"></select>
                        </div>
                        <div class="form-group col-xs-12 col-sm-6 col-md-3">
                            <select class="form-control" ng-change="searchAvailability()" ng-options="zone.id as zone.option for zone in form.zones" ng-model="availability.zone_id"></select>
                        </div>
                        <div class="col-visible-md col-md-4"></div>
                        <div class="form-group col-xs-12 col-md-4">
                            <button class="btn btn-primary btn-block" ng-click="searchAvailability()" ng-disabled="loadingInfo">Buscar</button>
                        </div>
                    </form>
                </div>
            </div>

            <div class="card-header hidden-xs">
                <h2 ng-bind="infoAvailability"></h2>
            </div>
        
            <div class="card-body card-padding">
                <div class="bs-body-search">
                    <form on-submit="return false;">
                        <div class="form-group col-xs-12">
                            <button class="btn btn-default btn-block" ng-hide="!loadingData" disabled="disabled" ng-bind="message"></button>
                        </div>
                        <div class="form-group col-xs-6 col-sm-6 col-md-4" ng-show="result && !loadingData" ng-repeat="item in result">
                            <button class="btn btn-default btn-block" ng-disabled="!item.availability" ng-bind="item.hour_format" ng-click="saveTemporalReserve(item)"></button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection