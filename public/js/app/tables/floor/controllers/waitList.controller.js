  angular.module('floor.controller')
      .controller('WaitListCtrl', function($rootScope, $scope, $uibModal, $timeout, FloorFactory, $interval, global) {

          var wm = this;
          var validaModal = false;

          wm.res_listado = {
              actives: [],
              canceled: []
          };

          wm.search = {
              show: true
          };

          $rootScope.$broadcast("floorClearSelected");

          wm.disabledModal = function() {
              validaModal = true;
              $timeout(function() {
                  validaModal = false;
              }, 600);
          };

          wm.searchReservation = function() {
              wm.search.show = !wm.search.show;
          };

          wm.selectWaitlist = function(waitlist) {
              $scope.$apply(function() {
                  $rootScope.$broadcast("floorEventEstablish", "sit", waitlist);
              });
          };

          wm.createWait = function(option, data) {
              if (validaModal === true) {
                  return;
              }
              var modalInstance = $uibModal.open({
                  templateUrl: 'ModalCreateWaitList.html',
                  controller: 'ModalWaitListCtrl',
                  controllerAs: 'wl',
                  size: '',
                  resolve: {
                      option: function() {
                          return option;
                      },
                      data: function() {
                          return data;
                      }
                  }
              });
          };

          wm.mailReservationShow = function(reservation) {
              wm.disabledModal();
              var modalMailReservation = $uibModal.open({
                  animation: true,
                  templateUrl: 'myModalMailReservation.html',
                  size: 'md',
                  //keyboard: false,
                  controller: 'ModalMailReservationCtrl',
                  controllerAs: 'vm',
                  resolve: {
                      reservation: function() {
                          return reservation;
                      }
                  }
              });
          };

          var waitList = function() {
              wm.res_listado.actives.length = 0;
              wm.res_listado.canceled.length = 0;

              angular.forEach(wm.reservations.data, function(reservation) {
                  if (reservation.wait_list == 1) {
                      if (reservation.res_reservation_status_id != 6) {
                          var reservationCopy = angular.copy(reservation);
                          reservationCopy.minutes = calculateMinutesTime("2016-11-08 " + reservationCopy.quote);
                          reservationCopy.time_out = false;

                          var interval = function() {
                              var now = moment();
                              var start_time = moment(reservationCopy.hours_reservation, "HH:mm:ss");
                              reservationCopy.time_wait_list = moment.utc(now.diff(start_time)).format("HH:mm");

                              var validaTime = calculateMinutesTime("2016-11-08 " + reservationCopy.time_wait_list);

                              if (validaTime >= reservationCopy.minutes) {
                                  reservationCopy.time_out = true;
                                  $interval.cancel(interval);
                              }
                          };

                          interval();
                          $interval(interval, 60000);

                          wm.res_listado.actives.push(reservationCopy);

                      } else {
                          wm.res_listado.canceled.push(angular.copy(reservation));
                      }
                  }
              });
          };

          var clear = function() {
              FloorFactory.isEditServer(false);
              angular.element('.bg-window-floor').removeClass('drag-dispel');
          };

          (function init() {
              wm.reservations = global.reservations;
              $scope.$watch("wm.reservations", waitList, true);

              clear();
          })();
      })
      .controller("ModalWaitListCtrl", function($rootScope, $state, $uibModalInstance, $q, reservationService, $timeout, option, data, FloorFactory, WaitListFactory, global) {

          var wl = this;
          var auxiliar;

          wl.reservation = {};
          wl.addGuest = true;
          wl.buttonText = 'Agregar a lista de espera';
          wl.title = "Nueva entrada";
          wl.option = option; //opcion del formulario : create | edit
          wl.covers = [];

          var listGuest = function() {
              var deferred = $q.defer();
              reservationService.getGuest()
                  .then(function(guests) {
                      wl.covers = guests;
                      wl.reservation.covers = 2;
                  }).catch(function(error) {
                      message.apiError(error);
                  }).finally(function() {
                      deferred.resolve();
                  });

              return deferred.promise;
          };

          var listDurations = function() {
              var deferred = $q.defer();

              reservationService.getDurations()
                  .then(function(durations) {
                      wl.durations = durations;
                      wl.reservation.quote = "00:15:00";
                  }).finally(function() {
                      deferred.resolve();
                  });

              return deferred.promise;
          };

          //Search guest list
          wl.searchGuest = function(name) {
              // console.log(name);
              if (auxiliar) $timeout.cancel(auxiliar);
              if (name === "") {
                  wl.guestList = [];
                  return;
              }
              var search = function() {
                  reservationService.getGuestList(name)
                      .then(function(response) {
                          wl.guestList = response.data.data.data;
                      }).catch(function(error) {
                          message.apiError(error);
                      });
              };

              auxiliar = $timeout(search, 500);
          };

          wl.selectGuest = function(guest) {
              wl.reservation.guest_id = guest.id;
              wl.guest = guest;
              wl.addGuest = false;
          };

          wl.removeGuest = function() {
              wl.reservation.guest_id = null;
              wl.newGuest = null;
              wl.guestList = [];
              wl.addGuest = true;
          };
          //End Search

          wl.cancel = function() {
              $uibModalInstance.dismiss('cancel');
          };

          wl.save = function() {
              if (!wl.reservation.guest_id) {
                  if (wl.newGuest) {
                      delete wl.reservation.guest_id;
                      wl.reservation.guest = wl.newGuest;
                  }
              } else {
                  delete wl.reservation.guest;
              }

              wl.reservation.guest = wl.newGuest;
              wl.buttonText = 'Enviando ...';

              if (wl.option == "create") {
                  save();
              } else {
                  update();
              }
          };

          var save = function() {
              reservationService.blackList.key(wl.reservation);
              reservationService.createWaitList(wl.reservation).then(
                  function success(response) {
                      global.reservations.add(response.data.data);
                      wl.buttonText = 'Agregar a lista de espera';
                      message.success(response.data.msg);
                      $uibModalInstance.dismiss('cancel');
                  },
                  function error(response) {
                      wl.buttonText = 'Agregar a lista de espera';
                      message.apiError(response.data);
                  });
          };

          var update = function() {
              reservationService.blackList.key(wl.reservation);
              reservationService.updateWaitList(wl.reservation).then(
                  function success(response) {
                      global.reservations.update(response.data.data);
                      wl.buttonText = 'Agregar a lista de espera';
                      message.success(response.data.msg);
                      $uibModalInstance.dismiss('cancel');
                  },
                  function error(response) {
                      wl.buttonText = 'Agregar a lista de espera';
                      message.apiError(response.data);
                  });
          };

          wl.delete = function() {
              var key = reservationService.blackList.key();
              reservationService.deleteWaitList(data.id, {
                  key: key
              }).then(
                  function success(response) {
                      global.reservations.update(response.data.data);
                      message.success(response.data.msg);
                      $uibModalInstance.dismiss('cancel');
                  },
                  function error(response) {
                      message.apiError(response.data);
                  });
          };

          var listResource = function() {
              return $q.all([listGuest(), listDurations()]);
          };

          var defineOption = function() {
              if (option === "edit") {

                  wl.reservation.id = data.id;
                  loadEditData();
              }
          };

          var loadEditData = function() {
              wl.title = "Editar entrada";

              if (data.guest !== null) {
                  wl.selectGuest(data.guest);
              }

              wl.reservation.covers = data.num_guest;
              wl.reservation.quote = data.quote;
              wl.reservation.note = data.note;
          };

          var init = function() {
              listResource().then(
                  function success(response) {
                      defineOption();
                  },
                  function error(response) {
                      console.error("listResource" + angular.toJson(response, true));
                  }
              );
          };

          init();
      });