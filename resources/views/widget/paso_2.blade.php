@extends('widget.layouts.main')

@section("title", "Paramontino | Confirmar")

@section("content")
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
                    <span>{{ $reservation->num_guest }} Guests</span>
                </div>
                <div class="info">
                    <a href="javascript:void(0)">Change Reservation</a>
                </div>
                <div class="info watch">
                    <span>Time to Complete</span>
                    <div class="timer">
                        <time-down expire="'{{ $time }}'"></time-down>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-xs-12 col-sm-8 p-r-0">
            <h4 class="m-t-0 c-blue">Confirmar Reservación</h4>
            <form novalidate>
                <div class="row">

                    <div class="col-sm-5">
                        <label>Nombres</label>
                        <div class="form-group">
                            <div class="fg-line">
                                <input type="text" class="form-control input-sm"  placeholder="Ingrese su nombre" ng-model="reservation.guest.first_name">
                            </div>
                        </div>
                    </div>

                    <div class="col-sm-7">
                        <label>Apellidos</label>
                        <div class="form-group">
                            <div class="fg-line">
                                <input type="text" class="form-control input-sm"  placeholder="Ingrese sus apellidos" ng-model="reservation.guest.last_name">
                            </div>
                        </div>
                    </div>

                    <div class="col-xs-12">
                        <label>Correo</label>
                        <div class="form-group">
                            <div class="fg-line">
                                <input type="email" class="form-control input-sm"  placeholder="usuario@bookersnap.com" ng-model="reservation.guest.email">
                            </div>
                        </div>
                    </div>

                    @if ($forms[0]['status'] == 1)
                    <div class="col-xs-12">
                        <label>Telefono mobil</label>
                        <div class="form-group">
                            <div class="fg-line">
                                <input type="text" class="form-control input-sm"  placeholder="55 555 555 555" ng-model="reservation.guest.phone">
                            </div>
                        </div>
                    </div>
                    @endif

                    @if ($forms[2]['status'] == 1)
                    <div class="col-xs-12">
                        <label>Nota de reservación</label>
                        <div class="form-group">
                            <div class="fg-line">
                                <input type="text" class="form-control input-sm"  placeholder="Alguna observacion" ng-model="reservation.note">
                            </div>
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
                        <label>Invitados</label>
                        <div class="form-group">
                            <div class="fg-line">
                                <input type="text" class="form-control input-sm"  placeholder="Añadir tecleando enter o espacio" ng-model="newGuest" ng-keyup="addGuest($event)">
                            </div>
                        </div>
                    </div>
                    @endif

                    @if ($forms[3]['status'] == 1)
                    <div class="col-xs-12">
                        <label>Profesión</label>
                        <div class="form-group">
                            <div class="fg-line">
                                <input type="text" class="form-control input-sm"  placeholder="Profesión u ocupación" ng-model="reservation.guest.profession">
                            </div>
                        </div>
                    </div>
                    @endif

                    @if ($forms[4]['status'] == 1)
                    <div class="col-xs-12">
                        <label>Como te enteraste</label>
                        <div class="form-group">
                            <div class="fg-line">
                                <input type="text" class="form-control input-sm"  placeholder="Como te enteraste, tv, radio, anuncios, periodico, etc." ng-model="reservation.guest.find_out">
                            </div>
                        </div>
                    </div>
                    @endif

                    <div class="col-xs-12 p-b-20">
                        <p> Yes, I would like to receive marketing emails or promotions from this restaurant in the future.</p>
                        <p>By confirming, you agree to Yelp Reservations' Terms Of Use & Privacy Policy.<br>
                            Yelp stores this information and sends it to restaurants for transactional and promotional purposes. We’ll text you with reservation status updates – to stop receiving them, just text back "4" at any time. Note that we’ll text you with reservation status updates.</p>
                    </div>
                </div>

                <div class="row">
                    <div class="col-sm-12 m-b-20">
                        <button type="submit" class="btn btn-primary pull-right" ng-click="save()" ng-disabled="loading">Confirmar reservación</button>
                    </div>
                </div>
            </form>
        </div>

    </div>
</div>
@endsection