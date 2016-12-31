@extends("widget.layouts.mainV2")

@section("title", "Bookersnap | Busqueda")

@section("content")
<div class="params" ng-controller="availabilityCtrl">
    <script type="text/javascript">
        var token = "{{ $token or '' }}";
    </script>
    <div class="card" ng-controller="confirmedCtrl">
        <div class="card-body card-padding">
            <div class="card-header">
                <h2 class="confirmed bs-color">Su reservacion ha sido completada!</h2>
            </div>
            <div class="bs-reserve">
                <div class="bs-detail">
                    <span><strong>{{ $reservation->microsite['name'] }}</strong></span>
                    <span>{{ $reservation->microsite['address'] }}</span>
                </div>

                <div class="bs-detail">
                <spa><strong  ng-bind="'{{ $reservation->date_reservation.' '.$reservation->hours_reservation }}' | fullDateBS"></strong></span>
                </div>

                <div class="bs-detail">
                    <span><strong>{{ $reservation->guest["first_name"].' '.$reservation->guest["last_name"] }}</strong></span>
                    <span>{{ $reservation->num_guest }} Invitados</span>
                    <span>{{ $reservation->email }}</span>
                    <span>{{ $reservation->phone }}</span>
                </div>

                <div class="row">
                    <div class="col-sm-12 m-b-20">
                        <button type="submit" class="bsb bsb-danger" ng-click="cancel()">Cancelar Reservación</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection