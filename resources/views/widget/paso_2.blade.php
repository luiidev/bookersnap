@extends('widget.layouts.main')

@section("title", "Paramontino | Confirmar")

@section("content")
<script type="text/javascript">
    var token = "{{ $token or '' }}";
</script>
<div class="card" ng-controller="reservationCtrl">
    <div class="card-body card-padding">
        <div class="col-xs-12 col-sm-4 content-info">
            <div class="reservation-info">
                <div class="site-info">
                    <h4 class="m-t-0 ">Paramontino</h4>
                    <p>100 Queen St W, Toronto, ON M5H 2N2 (Downtown Core)</p>
                </div>
                <div class="info">
                    <span ng-bind="'{{ $reservation->date }}' | dateBS"></span>
                </div>
                <div class="info">
                    <span ng-bind="'{{ $reservation->hour }}' | timeBS"></span>
                </div>
                <div class="info">
                    <span>{{ $reservation->num_guest }} Invitados</span>
                </div>
                <div class="info">
                    <a href="javascript:void(0)" ng-click="redirectBase()">Editar Reservación</a>
                </div>
                <div class="info watch">
                    <span>Tiempo para completar</span>
                    <div class="timer">
                        <time-down expire="'{{ $time }}'" on-finish="redirectBase()"></time-down>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-xs-12 col-sm-8 p-r-0">
            <h4 class="m-t-0 c-blue">Confirmar Reservación</h4>
            <form name="resForm" novalidate>
                <div class="row">

                    <div class="col-sm-5">
                        <div class="form-group" ng-class="{ 'has-error': errors['guest.first_name'].length}">
                            <label>* Nombres</label>
                            <input type="text" name="first_name" class="form-control input-sm" placeholder="Ingrese su nombre" ng-model="reservation.guest.first_name" ng-focus="clearErrors('guest.first_name')" required>
                            <p class="help-block" ng-repeat="error in errors['guest.first_name']" ng-bind="error"></p>
                        </div>
                    </div>

                    <div class="col-sm-7">
                        <div class="form-group" ng-class="{ 'has-error': errors['guest.last_name'].length}">
                            <label>* Apellidos</label>
                            <input type="text" name="last_name" class="form-control input-sm" placeholder="Ingrese sus apellidos" ng-model="reservation.guest.last_name" ng-focus="clearErrors('guest.last_name')" required>
                            <p class="help-block" ng-repeat="error in errors['guest.last_name']" ng-bind="error"></p>
                        </div>
                    </div>

                    <div class="col-xs-12">
                        <div class="form-group" ng-class="{ 'has-error': errors['guest.email'].length}">
                            <label>* Correo</label>
                            <input type="email" name="email" class="form-control input-sm" placeholder="usuario@bookersnap.com" ng-model="reservation.guest.email" ng-focus="clearErrors('guest.email')" required>
                            <p class="help-block" ng-repeat="error in errors['guest.email']"  ng-bind="error"></p>
                        </div>
                    </div>

                    @if ($forms[0]['status'] == 1)
                    <div class="col-xs-12">
                        <div class="form-group" ng-class="{ 'has-error': errors['guest.phone'].length}">
                            <label>Telefono mobil</label>
                            <input type="text" class="form-control input-sm"  placeholder="55 555 555 555" ng-model="reservation.guest.phone" ng-focus="clearErrors('guest.phone')">
                            <p class="help-block" ng-repeat="error in errors['guest.phone']" ng-bind="error"></p>
                        </div>
                    </div>
                    @endif

                    @if ($forms[2]['status'] == 1)
                    <div class="col-xs-12">
                        <div class="form-group" ng-class="{ 'has-error': errors['note'].length}">
                            <label>Nota de reservación</label>
                            <input type="text" class="form-control input-sm"  placeholder="Alguna observacion" ng-model="reservation.note" ng-focus="clearErrors('note')">
                            <p class="help-block" ng-repeat="error in errors['note']" ng-bind="error"></p>
                        </div>
                    </div>
                    @endif

                    @if ($forms[1]['status'] == 1)
                    <div class="col-xs-12 ng-hide"  ng-show="reservation.guest_list.length">
                        <div class="form-group guest-list">
                        <button class="btn btn-primary btn-xs" ng-repeat="guest in reservation.guest_list track by $index">  <span ng-bind="guest"></span> <i class="glyphicon glyphicon-remove" ng-click="removeGuest($index)"></i></button>
                        </div>
                    </div>

                    <div class="col-xs-12">
                        <div class="form-group" ng-class="{ 'has-error': errors['guest_list'].length}">
                            <label>Invitados</label>
                            <input type="text" class="form-control input-sm"  placeholder="Añadir tecleando enter o espacio" ng-model="newGuest" ng-focus="clearErrors('guest_list')" ng-keyup="addGuest($event)">
                            <p class="help-block" ng-repeat="error in errors['guest_list']" ng-bind="error"></p>
                        </div>
                    </div>
                    @endif

                    @if ($forms[3]['status'] == 1)
                    <div class="col-xs-12">
                        <div class="form-group" ng-class="{ 'has-error': errors['guest.profession'].length}">
                            <label>Profesión</label>
                            <input type="text" class="form-control input-sm"  placeholder="Profesión u ocupación" ng-model="reservation.guest.profession" ng-focus="clearErrors('guest.profession')">
                            <p class="help-block" ng-repeat="error in errors['guest.profession']" ng-bind="error"></p>
                        </div>
                    </div>
                    @endif

                    @if ($forms[4]['status'] == 1)
                    <div class="col-xs-12">
                        <div class="form-group" ng-class="{ 'has-error': errors['guest.find_out'].length}">
                            <label>Como te enteraste</label>
                            <input type="text" class="form-control input-sm"  placeholder="Como te enteraste, tv, radio, anuncios, periodico, etc." ng-model="reservation.guest.find_out" ng-focus="clearErrors('guest.find_out')">
                            <p class="help-block" ng-repeat="error in errors['guest.find_out']" ng-bind="error"></p>
                        </div>
                    </div>
                    @endif

                    <div class="col-xs-12 p-b-20">
                        <p  class="help-block"> * Los campos son obligatorios.</p>
                        <p> Yes, I would like to receive marketing emails or promotions from this restaurant in the future.</p>
                        <p>By confirming, you agree to Yelp Reservations' Terms Of Use & Privacy Policy.<br>
                            Yelp stores this information and sends it to restaurants for transactional and promotional purposes. We’ll text you with reservation status updates – to stop receiving them, just text back "4" at any time. Note that we’ll text you with reservation status updates.</p>
                    </div>
                </div>
            </form>
            <div class="row">
                <div class="col-sm-12 m-b-20">
                    <button type="submit" class="btn btn-primary pull-right" ng-click="save()" ng-disabled="loading || resForm.$invalid">Confirmar reservación</button>
                </div>
            </div>
        </div>

    </div>
</div>
@endsection