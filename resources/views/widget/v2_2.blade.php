@extends("widget.layouts.mainV2")

@section("title", "Bookersnap | Reservación")

@section("content")
<script type="text/javascript">
    var token = "{{ $token or '' }}";
</script>
<div class="params" ng-controller="reservationCtrl">
    <div class="card" style="height: 475px; overflow: auto;">
        <div class="card-body card-padding">
            <div class="reservation-info">
                <div class="info">
                    <i class="glyphicon glyphicon-calendar"></i><span ng-bind="'{{ $reservation->date }}' | dateBS"></span>
                </div>
                <div class="info">
                    <i class="glyphicon glyphicon-time"></i><span ng-bind="'{{ $reservation->hour }}' | timeBS"></span>
                </div>
                <div class="info">
                    <i class="glyphicon glyphicon-user"></i><span>{{ $reservation->num_guest }} Invitados</span>
                </div>
                <div class="info edit">
                    <i class="glyphicon glyphicon-arrow-left"></i><a href="javascript:void(0)" ng-click="redirectBase()">Editar Reservación</a>
                </div>
                <div class="info watch">
                    <span class="c-text">Tiempo para completar</span>
                    <div class="timer">
                        <time-down expire="'{{ $time }}'" on-finish="redirectBase()"></time-down>
                    </div>
                </div>
            </div>

            <div class="form">
                <h4 class="m-t-0 c-blue bs-color">Confirmar Reservación</h4>
                <form name="resForm" novalidate>
                    <div class="row">

                        <div>
                            <div class="form-group" ng-class="{ 'has-error': errors['guest.first_name'].length}">
                                <label class="hidden-xs">* Nombres</label>
                                <input type="text" name="first_name" class="form-control input-sm" placeholder="Ingrese su nombre" ng-model="reservation.guest.first_name" ng-focus="clearErrors('guest.first_name')" required>
                                <p class="help-block" ng-repeat="error in errors['guest.first_name']" ng-bind="error"></p>
                            </div>
                        </div>

                        <div>
                            <div class="form-group" ng-class="{ 'has-error': errors['guest.last_name'].length}">
                                <label class="hidden-xs">* Apellidos</label>
                                <input type="text" name="last_name" class="form-control input-sm" placeholder="Ingrese sus apellidos" ng-model="reservation.guest.last_name" ng-focus="clearErrors('guest.last_name')" required>
                                <p class="help-block" ng-repeat="error in errors['guest.last_name']" ng-bind="error"></p>
                            </div>
                        </div>

                        <div>
                            <div class="form-group" ng-class="{ 'has-error': errors['guest.email'].length}">
                                <label class="hidden-xs">* Correo</label>
                                <input type="email" name="email" class="form-control input-sm" placeholder="usuario@bookersnap.com" ng-model="reservation.guest.email" ng-focus="clearErrors('guest.email')" required>
                                <p class="help-block" ng-repeat="error in errors['guest.email']"  ng-bind="error"></p>
                            </div>
                        </div>

                        @if ($forms[0]['status'] == 1)
                        <div>
                            <div class="form-group" ng-class="{ 'has-error': errors['guest.phone'].length}">
                                <label class="hidden-xs">Telefono mobil</label>
                                <input type="text" class="form-control input-sm"  placeholder="55 555 555 555" ng-model="reservation.guest.phone" ng-focus="clearErrors('guest.phone')">
                                <p class="help-block" ng-repeat="error in errors['guest.phone']" ng-bind="error"></p>
                            </div>
                        </div>
                        @endif

                        @if ($forms[2]['status'] == 1)
                        <div>
                            <div class="form-group" ng-class="{ 'has-error': errors['note'].length}">
                                <label class="hidden-xs">Nota de reservación</label>
                                <input type="text" class="form-control input-sm"  placeholder="Alguna observacion" ng-model="reservation.note" ng-focus="clearErrors('note')">
                                <p class="help-block" ng-repeat="error in errors['note']" ng-bind="error"></p>
                            </div>
                        </div>
                        @endif

                        @if ($forms[1]['status'] == 1)
                        <div class=" ng-hide"  ng-show="reservation.guest_list.length">
                            <div class="form-group guest-list">
                            <button class="btn btn-primary btn-xs" ng-repeat="guest in reservation.guest_list track by $index">  <span ng-bind="guest"></span> <i class="glyphicon glyphicon-remove" ng-click="removeGuest($index)"></i></button>
                            </div>
                        </div>

                        <div>
                            <div class="form-group" ng-class="{ 'has-error': errors['guest_list'].length}">
                                <label class="hidden-xs">Invitados</label>
                                <input type="text" class="form-control input-sm"  placeholder="Añadir tecleando enter o espacio" ng-model="newGuest" ng-focus="clearErrors('guest_list')" ng-keyup="addGuest($event)">
                                <p class="help-block" ng-repeat="error in errors['guest_list']" ng-bind="error"></p>
                            </div>
                        </div>
                        @endif

                        @if ($forms[3]['status'] == 1)
                        <div>
                            <div class="form-group" ng-class="{ 'has-error': errors['guest.profession'].length}">
                                <label class="hidden-xs">Profesión</label>
                                <input type="text" class="form-control input-sm"  placeholder="Profesión u ocupación" ng-model="reservation.guest.profession" ng-focus="clearErrors('guest.profession')">
                                <p class="help-block" ng-repeat="error in errors['guest.profession']" ng-bind="error"></p>
                            </div>
                        </div>
                        @endif

                        @if ($forms[4]['status'] == 1)
                        <div>
                            <div class="form-group" ng-class="{ 'has-error': errors['guest.find_out'].length}">
                                <label class="hidden-xs">Como te enteraste</label>
                                <input type="text" class="form-control input-sm"  placeholder="Como te enteraste, tv, radio, anuncios, periodico, etc." ng-model="reservation.guest.find_out" ng-focus="clearErrors('guest.find_out')">
                                <p class="help-block" ng-repeat="error in errors['guest.find_out']" ng-bind="error"></p>
                            </div>
                        </div>
                        @endif

                        <div class="terms">
                            <p>Al hacer click en el siguiente boton "Confimar Reservación" acepta los siguientes <a href="javascript:void(0)">Terminos y Condiciones</a>.</p>
                        </div>
                    </div>
                </form>
            </div>

        </div>
    </div>

    <div class="row">
        <div class="search">
            <div><button class="bsb bsb-block bsb-bookersnap bs-bgm" type="submit" ng-click="save()" ng-disabled="loading || resForm.$invalid">Confirmar Reservación</button></div>
        </div>
    </div>
</div>
@endsection