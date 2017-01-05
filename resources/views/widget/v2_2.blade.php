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
                    <i class="glyphicon glyphicon-arrow-left"></i><a href="javascript:void(0)" ng-click="redirectBaseEdit()">Editar Reservación</a>
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

                        <div class="form-group" ng-class="{ 'has-error': errors['guest.first_name'].length}">
                            <label>* Nombres</label>
                            <input type="text" name="first_name" class="form-control input-sm" placeholder="Ingrese su nombre" ng-model="reservation.guest.first_name" ng-focus="clearErrors('guest.first_name')" required>
                            <p class="help-block" ng-repeat="error in errors['guest.first_name']" ng-bind="error"></p>
                        </div>


                        <div class="form-group" ng-class="{ 'has-error': errors['guest.last_name'].length}">
                            <label>* Apellidos</label>
                            <input type="text" name="last_name" class="form-control input-sm" placeholder="Ingrese sus apellidos" ng-model="reservation.guest.last_name" ng-focus="clearErrors('guest.last_name')" required>
                            <p class="help-block" ng-repeat="error in errors['guest.last_name']" ng-bind="error"></p>
                        </div>

                        <div class="form-group text-center" ng-class="{ 'has-error': errors['guest.birthdate'].length}" ng-click="clearErrors('guest.birthdate')">
                                <input type="hidden" name="birthdate" ng-model="reservation.guest.birthdate" required>
                                <label class="">* Cumpleaños</label>
                                <select class="select-sm pull-left" name="year" ng-options="year for year in years" ng-model="year" ng-change="changeYear(year)">
                                    <option value="" disabled="disabled" selected="true">Año</option>
                                </select>
                                <select class="select-sm month-w" name="month" ng-options="month.id as month.label for month in months" ng-model="month" ng-change="changeMonth(month)">
                                    <option value="" disabled="disabled" selected="true">Mes</option>
                                </select>
                                <select class="select-sm pull-right" name="day" id="day" ng-options="day for day in days" ng-model="day" ng-change="changeDay(day)">
                                    <option value="" disabled="disabled" selected="true">Día</option>
                                </select>
                                <p class="help-block" ng-repeat="error in errors['guest.birthdate']" ng-bind="error"></p>
                        </div>

                        <div class="form-group" ng-class="{ 'has-error': errors['guest.email'].length}">
                            <label>* Correo</label>
                            <input type="email" name="email" class="form-control input-sm" placeholder="usuario@bookersnap.com" ng-model="reservation.guest.email" ng-focus="clearErrors('guest.email')" required>
                            <p class="help-block" ng-repeat="error in errors['guest.email']"  ng-bind="error"></p>
                        </div>

                        @if ($forms[0]['status'] == 1)
                        <div class="form-group" ng-class="{ 'has-error': errors['guest.phone'].length}">
                            <label>Telefono mobil</label>
                            <input type="text" class="form-control input-sm"  placeholder="55 555 555 555" ng-model="reservation.guest.phone" ng-focus="clearErrors('guest.phone')">
                            <p class="help-block" ng-repeat="error in errors['guest.phone']" ng-bind="error"></p>
                        </div>
                        @endif

                        @if ($forms[2]['status'] == 1)
                        <div class="form-group" ng-class="{ 'has-error': errors['note'].length}">
                            <label>Nota de reservación</label>
                            <input type="text" class="form-control input-sm"  placeholder="Alguna observacion" ng-model="reservation.note" ng-focus="clearErrors('note')">
                            <p class="help-block" ng-repeat="error in errors['note']" ng-bind="error"></p>
                        </div>
                        @endif

                        @if ($forms[1]['status'] == 1)
                        <div class=" ng-hide"  ng-show="reservation.guest_list.length">
                            <div class="form-group guest-list">
                            <button class="bsb bsb-bookersnap bsb-xs bsb-m-5 " ng-repeat="guest in reservation.guest_list track by $index">  <span ng-bind="guest"></span> <i class="glyphicon glyphicon-remove" ng-click="removeGuest($index)"></i></button>
                            </div>
                        </div>

                        <div class="form-group" ng-class="{ 'has-error': errors['guest_list'].length}">
                            <label>Invitados</label>
                            <input type="text" class="form-control input-sm"  placeholder="Añadir tecleando enter o espacio" ng-model="newGuest" ng-focus="clearErrors('guest_list')" ng-keyup="addGuest($event)">
                            <p class="help-block" ng-repeat="error in errors['guest_list']" ng-bind="error"></p>
                        </div>
                        @endif

                        @if ($forms[3]['status'] == 1)
                        <div class="form-group" ng-class="{ 'has-error': errors['guest.profession'].length}">
                            <label>Profesión</label>
                            <input type="text" class="form-control input-sm"  placeholder="Profesión u ocupación" ng-model="reservation.guest.profession" ng-focus="clearErrors('guest.profession')">
                            <p class="help-block" ng-repeat="error in errors['guest.profession']" ng-bind="error"></p>
                        </div>
                        @endif

                        @if ($forms[4]['status'] == 1)
                        <div class="form-group" ng-class="{ 'has-error': errors['guest.find_out'].length}">
                            <label>Como te enteraste</label>
                            <input type="text" class="form-control input-sm"  placeholder="Como te enteraste, tv, radio, anuncios, periodico, etc." ng-model="reservation.guest.find_out" ng-focus="clearErrors('guest.find_out')">
                            <p class="help-block" ng-repeat="error in errors['guest.find_out']" ng-bind="error"></p>
                        </div>
                        @endif

                        <div class="terms">
                            <p  class="help-block"> * Los campos son obligatorios.</p>
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