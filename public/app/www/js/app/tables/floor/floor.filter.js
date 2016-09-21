angular.module('floor.filter', [])
	.filter("statusReservation", function() {
		return function(valor) {
			if (valor != null) {
				var name_status = "";
				switch (valor) {
					case 1:
						name_status = "not-confirmed";
						break;
					case 2:
						name_status = "confirmed";
						break;
					case 3:
						name_status = "left-message";
						break;
					case 4:
						name_status = "no-answer";
						break;
					case 5:
						name_status = "wrong-number";
						break;
					case 6:
						name_status = "partially-arrived";
						break;
					case 7:
						name_status = "check-dropped";
						break;
					case 8:
						name_status = "paged";
						break;
					case 9:
						name_status = "canceled-guest";
						break;
					case 10:
						name_status = "canceled-restaurant";
						break;
					case 11:
						name_status = "no-show";
						break;
					case 12:
						name_status = "finished";
						break;
					default:
						name_status = "not-confirmed";
						break;
				}
				return name_status;
			}
		};
	});