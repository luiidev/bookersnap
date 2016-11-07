angular.module('book.service', [])
	.factory('BookDataFactory', function($http, ApiUrlMesas) {
		return {
			getBooks: function(vDate) {
				// return $http.get(ApiUrlMesas+"/book/"+vDate); 
			}
		};

	})
	.factory('BookFactory', function($q, reservationService, CalendarService) {

		return {
			getReservations: function(reload, date) {
				var defered = $q.defer();

				reservationService.getReservations(reload, date).then(
					function success(response) {
						response = response.data.data;
						defered.resolve(response);
					},
					function error(response) {
						defered.reject(response);
					}
				);
				return defered.promise;
			},
			listBook: function(hours, reservations, blocks) {
				var self = this;
				var book = [];

				angular.forEach(hours, function(hour, key) {
					var existsReservation = self.existsReservation(hour, reservations);

					var dataBook = {
						time: hour.time,
						time_text: hour.name,
						reservation: {
							exists: existsReservation.exists,
							data: existsReservation.data
						},
						block: {
							exists: false,
							data: []
						}
					};

					book.push(dataBook);

				});

				return book;
			},
			existsReservation: function(hour, reservations) {
				var exists = {
					exists: false,
					data: []
				};

				angular.forEach(reservations, function(reservation, key) {
					if (hour.time === reservation.hours_reservation) {
						exists.exists = true;
						exists.data = reservation;
					}
				});

				return exists;
			}
		};
	})
	.factory('BookDateFactory', function() {
		return {
			rangeDateAvailable: function(minSteep, turn) {

				var iniHour = turn.hours_ini.split(":");
				var iniMin = turn.hours_ini.split(":");

				var endHour = turn.hours_end.split(":");
				var endMin = turn.hours_end.split(":");

				endHour = parseInt(endHour[0]);
				endMin = parseInt(endMin[1]);

				var hour = parseInt(iniHour[0]);
				var min = parseInt(iniMin[1]);

				var time = [];

				while (hour <= endHour) {

					var sHorario = (hour <= 12) ? "AM" : "PM";

					var hora = hour + ":" + ((min === 0) ? "00" : min) + " " + sHorario;
					time.push(hora);

					if (min == (60 - minSteep)) {
						hour += 1;
						min = 0;
					} else {
						if (hour == endHour && min == endMin) {
							hour = 45;
						}
						min += minSteep;
					}

				}

				return time;
			},
			getDate: function(language, options, date) {
				var me = this;
				date = (date) ? null : date;
				if (date !== null) {
					date = me.changeformatDate(date.toString());
					return new Date(date).toLocaleDateString(language, options);
				} else {
					return new Date().toLocaleDateString(language, options);
				}
			},
			setDate: function(date, option) {

				var me = this;

				date = me.changeformatDate(date);

				var d = new Date(date);

				if (option == "+") {
					d.setDate(d.getDate() + 1);
				} else {
					d.setDate(d.getDate() - 1);
				}

				var dateFinal = me.getDate("es-ES", {}, d);

				return dateFinal;
			},
			changeformatDate: function(date) {

				var d = date.split("/");
				var dateFormat = d[2] + "-" + d[1] + "-" + d[0];

				return dateFormat;
			}

		};

	})

;