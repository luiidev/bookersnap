@extends('widget.layouts.main')

@section("title", "Paramontino | Confirmación")

@section("content")
<script type="text/javascript">
    var token = "{{ $token or '' }}";
</script>
<div class="card" ng-controller="confirmedCtrl">
    <div class="card-header confirmed c-blue">
        <h2>Su mesa ha sido reservada!</h2>
    </div>

    <div class="card-body card-padding">
        <div class="bs-reserve">
            <div class="bs-detail">
                <span><strong>Paramontino</strong></span>
                <span ng-bind="'{{ $reservation->date_reservation.' '.$reservation->hours_reservation }}' | fullDateBS"></span>
            </div>

            <div class="bs-detail">
                <span><strong>100 Queen St W, Toronto, ON M5H 2N2</strong></span>
            </div>

            <div class="bs-detail">
                <span><strong>{{ $reservation->guest["first_name"].' '.$reservation->guest["last_name"] }}</strong></span>
                <span>{{ $reservation->num_guest }} Invitados</span>
                <span>{{ $reservation->email }}</span>
                <span>{{ $reservation->phone }}</span>
            </div>

            <div class="row">
                <div class="col-sm-12 m-b-20">
                    <button type="submit" class="btn btn-danger" ng-click="cancel()">Cancelar Reservación</button>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection