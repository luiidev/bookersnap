angular.module('guest.service', [])
    .factory('GuestDataFactory', function($http, ApiUrlMesas, ApiUrlRoot) {
        return {
            getAllGuest: function(params) {
                return $http.get(ApiUrlMesas + "/guests?" + params);
            },
            getAllTags: function() {
                return $http.get(ApiUrlMesas + "/guests/tags");
            },
            getGuest: function(idGuest) {
                return $http.get(ApiUrlMesas + "/guests/" + idGuest);
            },
            create: function(vData) {
                return $http.post(ApiUrlMesas + '/guests', vData);
            },
            update: function(vData) {
                return $http.put(ApiUrlMesas + '/guests/' + vData.id, vData);
            },
            getReservations: function(idGuest, options) {
                return $http.get(ApiUrlMesas + "/guests/" + idGuest + "/reservations?" + options);
            }
        };

    })

.factory('GuestFactory', function($http, $q, GuestDataFactory, CustomTagGuestDataService) {
    return {
        guestList: function(params) {
            var guestAll = [];
            var defered = $q.defer();
            var me = this;

            GuestDataFactory.getAllGuest(params).success(function(data) {
                data = data.data.data;

                angular.forEach(data, function(value, key) {
                    value.contact = me.parserContactData(value);
                    guestAll.push(value);
                });

                defered.resolve(guestAll);

            }).error(function(data, status, headers) {
                var response = jsonErrorData(data, status, headers);
                defered.reject(response);
            });

            return defered.promise;
        },
        getTabSelected: function(tabItem) {
            var contentTab = {};
            if (tabItem == 1) {
                contentTab.active = "datos.html";
                contentTab.tab1 = "active";
                contentTab.tab2 = "";
            }

            if (tabItem == 2) {
                contentTab.active = "datos-contact.html";
                contentTab.tab1 = "";
                contentTab.tab2 = "active";
            }

            return contentTab;
        },
        insertDataContact: function(elements, element, type) {

            var jsonData = JSON.stringify(elements);

            if (element !== undefined) {
                if (jsonData.indexOf(element) == -1) {
                    var data = {
                        email: element
                    };

                    if (type == "telefono") {
                        data = {
                            number: element
                        };
                    }

                    elements.push(data);
                } else {
                    messageAlert("Alerta", "El " + type + " ya ha sido agregado", "info", 0, true);
                }
            } else {
                messageAlert("Alerta", "El " + type + " no es correcto", "info", 0, true);
            }
            return elements;
        },
        existsTag: function(tagList, tag) {
            var index = null;

            angular.forEach(tagList, function(value, key) {
                if (value.id == tag) {
                    index = key;
                }
            });

            return index;
        },
        saveGuest: function(dataGuest, option) {
            var defered = null;
            var me = this;

            if (option == "create") {
                defered = GuestDataFactory.create(dataGuest);
            } else {
                defered = GuestDataFactory.update(dataGuest);
            }

            return defered;
        },
        getGuest: function(idGuest) {
            var defered = $q.defer();

            GuestDataFactory.getGuest(idGuest).success(function(data) {
                data = data.data;

                var guestData = {
                    guest: {
                        id: data.id,
                        first_name: data.first_name,
                        last_name: data.last_name,
                        birthdate: (data.birthdate == "0000-00-00") ? "1970-01-01" : data.birthdate,
                        gender: {
                            id: data.gender
                        },
                        phones: [],
                        emails: [],
                        tags: [],
                        custom_tags: []
                    }
                };

                angular.forEach(data.phones, function(value, key) {
                    guestData.guest.phones.push({
                        id: value.id,
                        number: value.number
                    });
                });

                angular.forEach(data.emails, function(value, key) {
                    guestData.guest.emails.push({
                        id: value.id,
                        email: value.email
                    });
                });

                angular.forEach(data.tags, function(value, key) {
                    guestData.guest.tags.push({
                        id: value.id,
                        res_guest_tag_gategory_id: value.res_guest_tag_gategory_id,
                        name: value.name
                    });
                });

                angular.forEach(data.customs_tags, function(value, key) {
                    guestData.guest.custom_tags.push({
                        id: value.id,
                        name: value.name,
                        res_guest_tag_gategory_id: 4
                    });
                });

                defered.resolve(guestData);

            }).error(function(data, status, headers) {
                var response = jsonErrorData(data, status, headers);
                defered.reject(response);
            });

            return defered.promise;
        },
        showTags: function(guestTags, tagsListGuest) {

            angular.forEach(guestTags, function(value, key) {
                angular.forEach(tagsListGuest, function(data, key) {
                    if (data.id == value.res_guest_tag_gategory_id) {
                        tagsListGuest[key].data.push({
                            id: value.id,
                            name: value.name,
                            res_guest_tag_category_id: data.id
                        });
                    }
                });

            });

            return tagsListGuest;
        },
        getTags: function() {
            var defered = $q.defer();
            var tagsList = [];
            var tagsListAdd = [];

            GuestDataFactory.getAllTags().success(function(data) {
                tagsList = data.data;

                angular.forEach(tagsList, function(value, key) {
                    tagsListAdd.push({
                        id: value.id,
                        data: []
                    });
                });

                var response = {
                    tagsList: tagsList,
                    tagsListAdd: tagsListAdd
                };

                defered.resolve(response);

            }).error(function(data, status, headers) {
                defered.reject(data);
            });

            return defered.promise;
        },
        parserContactData: function(value) {
            var contact = "";

            if (value.phones.length === 0 && value.emails.length === 0) {
                contact = "sin telefono / correo";
            } else {

                if (value.phones.length > 0) {
                    contact = value.phones[0].number;
                }

                if (value.emails.length > 0) {
                    contact = value.emails[0].email;
                }
            }
            return contact;
        },
        reservationsList: function(idGuest, options) {
            var defered = $q.defer();

            GuestDataFactory.getReservations(idGuest, options).success(function(data) {
                var reservData = {
                    pagination: {
                        last_page: data.last_page,
                        next_page_url: data.next_page_url,
                        per_page: data.per_page,
                        total: data.total
                    },
                    data: []
                };

                angular.forEach(data.data, function(value, key) {
                    value.date_reservation_text = convertTextToDate("es-ES", {
                        weekday: "long",
                        month: "short",
                        day: "numeric"
                    }, value.date_reservation);
                    value.hours_reservation_text = defineTimeSytem(value.hours_reservation);

                    reservData.data.push(value);
                });

                defered.resolve(reservData);
            }).error(function(data, status, headers) {
                var response = jsonErrorData(data, status, headers);
                defered.reject(response);
            });

            return defered.promise;
        },
        getResumenReservation: function(idGuest) {
            var defered = $q.defer();

            GuestDataFactory.getReservations(idGuest, "").success(function(data) {

                var reservData = {
                    finished: 0,
                    canceled: 0
                };

                angular.forEach(data.data, function(value, key) {

                    if (value.res_reservation_status_id == 9 || value.res_reservation_status_id == 10) {
                        reservData.canceled += 1;
                    }

                    if (value.res_reservation_status_id == 12) {
                        reservData.finished += 1;
                    }

                });

                defered.resolve(reservData);
            }).error(function(data, status, headers) {
                var response = jsonErrorData(data, status, headers);
                defered.reject(response);
            });

            return defered.promise;
        },
        getTagsCustomGuest: function() {
            var defered = $q.defer();

            CustomTagGuestDataService.getListTagGuestCustom().then(
                function success(response) {
                    defered.resolve(response.data);
                },
                function error(response) {
                    defered.reject(response.data);
                });
            return defered.promise;
        },
        getIndexTag: function(tagsList, idTag) {
            //Obtiene el indice del tag, del listado general de tags
            var index = null;

            angular.forEach(tagsList.tags, function(tags, key) {
                if (tags.id == idTag) {
                    index = key;
                }
            });

            return index;
        },
        checkActiveTags: function(tagsList, tagsListAdd) {
            //Activamos los tags en la vista, solo los tags que ha agregado el guest guest
            var self = this;
            angular.forEach(tagsList, function(tags, keyTag) {

                angular.forEach(tags.tags, function(value, key) {
                    var exists = self.isExistsTagListAdd(tagsListAdd[keyTag], value.id);

                    if (exists) {
                        value.active = true;
                    }
                });
            });
        },
        isExistsTagListAdd: function(tagsListAdd, idTag) {
            //Saber si el tag esta agregado a la lista de tags del guest
            var response = false;
            angular.forEach(tagsListAdd.data, function(value, key) {
                if (value.id == idTag) {
                    response = true;
                }
            });

            return response;
        }
    };
})

;