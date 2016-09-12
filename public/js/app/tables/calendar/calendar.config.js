/**
 * Created by BS on 25/08/2016.
 */

angular.module('calendar.app', ['calendar.controller', 'calendar.service'])

    .config(function ($stateProvider) {
        $stateProvider
            .state ('calendar-index', {
                url: '/calendar',
                templateUrl: '/js/app/tables/calendar/view/index.html',
                controller: 'CalendarIndexController',
                controllerAs: 'vm',
                resolve: {
                    loadPlugin: function ($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'css',
                                insertBefore: '#app-level',
                                files: [
                                    '../../../library/bower_components/fullcalendar/dist/fullcalendar.min.css',
                                ]
                            },
                            {
                                name: 'vendors',
                                insertBefore: '#app-level-js',
                                files: [
                                    '../../../library/sparklines/jquery.sparkline.min.js',
                                    '../../../library/bower_components/jquery.easy-pie-chart/dist/jquery.easypiechart.min.js',
                                    '../../../library/bower_components/simpleWeather/jquery.simpleWeather.min.js'
                                ]
                            }
                        ])
                    }
                }
            })

    })

    .factory("$response", function(){
        var error = function(response) {
            if (typeof response.data == "object") {
                    if (response.data.error !== null) {
                        swal("Error", response.data.error.user_msg || "Ocurrió un error en el servidor", "error");
                    } else {
                        if (response.status == 401 || response.status == 403) {
                            swal("Error", "No tiene permisos para realizar esta acción", "error");
                        } else {
                            swal("Error", "Ocurrió un error en el servidor", "error");
                        }
                    }
            } else {
                swal("Error", "Ocurrió un error en el servidor", "error");
            }
        }

        return {
            error: error
        }
    });