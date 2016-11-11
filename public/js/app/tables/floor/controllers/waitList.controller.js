  angular.module('floor.controller')
      .controller('WaitListCtrl', function($rootScope, $scope, $uibModal, $timeout, FloorFactory, ServerDataFactory, WaitListFactory) {

          var wm = this;
          var validaModal = false;

          wm.res_listado = [];
          wm.res_listado_canceled = [];

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

          wm.selectWaitlist = function(waitlist) {
              $scope.$apply(function() {
                  $rootScope.$broadcast("floorEventEstablish", "sit", waitlist);
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

          var init = function() {
              //Limpiar data y estilos de servers
              FloorFactory.isEditServer(false);
              angular.element('.bg-window-floor').removeClass('drag-dispel');
              // angular.element('.table-zone').removeClass("selected-table");

              ServerDataFactory.cleanTableServerItems();

              getListWailList(false);
          };

          var getListWailList = function(reload) {
              WaitListFactory.getWailList(reload).then(
                  function success(response) {
                      wm.res_listado = response.actives;
                      wm.res_listado_canceled = response.canceled;
                      console.log("getListReservationss " + angular.toJson(wm.res_listado, true));
                  },
                  function error(response) {
                      console.error("getListReservations " + angular.toJson(response, true));
                  }
              );
          };

          var addWaitListNotification = function(dataWaitList) {

              var waitListData = FloorFactory.parseDataReservation(dataWaitList.data);
              waitListData = WaitListFactory.setDataWaitList([waitListData]);

              switch (dataWaitList.action) {
                  case "create":
                      $scope.$apply(function() {
                          wm.res_listado.push(waitListData.actives[0]);
                      });
                      break;
                  case "update":
                      $scope.$apply(function() {
                          WaitListFactory.updateWaitList(wm.res_listado, waitListData.actives[0]);
                      });
                      break;
                  case "delete":
                      $scope.$apply(function() {
                          console.log("delete " + angular.toJson(waitListData, true));
                          WaitListFactory.deleteWaitList(wm.res_listado, wm.res_listado_canceled, waitListData.canceled[0]);
                      });
                      break;
              }
          };

          $scope.$on("NotifyFloorWaitListReload", function(evt, data) {
              //console.log("Nueva lista de espera " + angular.toJson(data, true));
              addWaitListNotification(data);

              alertMultiple("Notificación: ", data.user_msg, "inverse", null, 'top', 'left', 10000, 20, 150);
          });

          init();
      })
      .controller("ModalWaitListCtrl", function($rootScope, $state, $uibModalInstance, $q, reservationService, $timeout, option, data, FloorFactory, WaitListFactory) {

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
              console.log(name);
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

              WaitListFactory.saveWaitList(wl.reservation, wl.option).then(
                  function success(response) {
                      wl.buttonText = 'Agregar a lista de espera';
                      message.success(response.data.msg);
                      $uibModalInstance.dismiss('cancel');
                  },
                  function error(response) {
                      wl.buttonText = 'Agregar a lista de espera';
                      console.error("saveWait " + angular.toJson(error, true));
                      message.apiError(error);
                  }
              );
          };

          wl.delete = function() {
              reservationService.deleteWaitList(data.reservation_id).then(
                  function success(response) {
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

                  wl.reservation.id = data.reservation_id;
                  loadEditData();
              }
          };

          var loadEditData = function() {
              wl.title = "Editar entrada";

              if (data.guest !== null) {
                  wl.selectGuest(data.guest);
              }

              wl.reservation.covers = data.num_people;
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