@extends('widget.layouts.main')

@section("title", "Paramontino | Confirmar")

@section("content")
<div class="card">
    <div class="card-body card-padding">

        <div class="col-xs-12 col-sm-4 content-info">
            <div class="reservation-info">
                <div class="site-info">
                    <h4 class="m-t-0 ">Paramontino</h4>
                    <p>100 Queen St W, Toronto, ON M5H 2N2 (Downtown Core)</p>
                </div>
                <div class="info">
                    <span ng-bind="'{{ $date }}' | dateBS"></span>
                </div>
                <div class="info">
                    <span ng-bind="'{{ $hour }}' | hourFormat"></span>
                </div>
                <div class="info">
                    <span>{{ $num_guest }} Guests</span>
                </div>
                <div class="info">
                    <a href="javascript:void(0)">Change Reservation</a>
                </div>
                <div class="info watch">
                    <span>Time to Complete</span>
                    <div class="timer">
                        <span>1:39</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-xs-12 col-sm-8 p-r-0">
            <h4 class="m-t-0 c-blue">Confirmar Reservación</h4>
            <form  name="availavilitySearchForm" novalidate>
                <div class="row">

                    <div class="col-sm-5">
                        <label>Nombres</label>
                        <div class="form-group">
                            <div class="fg-line">
                                <input type="text" class="form-control input-sm"  placeholder="Ingrese su nombre">
                            </div>
                        </div>
                    </div>

                    <div class="col-sm-7">
                        <label>Apellidos</label>
                        <div class="form-group">
                            <div class="fg-line">
                                <input type="text" class="form-control input-sm"  placeholder="Ingrese sus apellidos">
                            </div>
                        </div>
                    </div>

                    <div class="col-xs-12">
                        <label>Correo</label>
                        <div class="form-group">
                            <div class="fg-line">
                                <input type="text" class="form-control input-sm"  placeholder="usuario@bookersnap.com">
                            </div>
                        </div>
                    </div>

                    <div class="col-xs-12">
                        <label>Telefono mobil</label>
                        <div class="form-group">
                            <div class="fg-line">
                                <input type="text" class="form-control input-sm"  placeholder="55 555 555 555">
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-xs-12">
                        <label>Nota de reservación</label>
                        <div class="form-group">
                            <div class="fg-line">
                                <input type="text" class="form-control input-sm"  placeholder="Alguna observacion">
                            </div>
                        </div>
                    </div>
                    <div class="col-xs-12 p-b-20">
                        <p> Yes, I would like to receive marketing emails or promotions from this restaurant in the future.</p>
                        <p>By confirming, you agree to Yelp Reservations' Terms Of Use & Privacy Policy.<br>
                            Yelp stores this information and sends it to restaurants for transactional and promotional purposes. We’ll text you with reservation status updates – to stop receiving them, just text back "4" at any time. Note that we’ll text you with reservation status updates.</p>
                    </div>
                </div>

                <div class="row">
                    <div class="col-sm-12 m-b-20">
                        <button class="btn btn-primary pull-right" >Confirmar reservación</button>
                    </div>
                </div>
            </form>
        </div>

    </div>
</div>
@endsection