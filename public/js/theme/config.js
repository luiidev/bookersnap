materialAdmin
    .config(function ($stateProvider, $urlRouterProvider){
        $urlRouterProvider.otherwise("/home");


        $stateProvider
        
            //------------------------------
            // HOME
            //------------------------------

            .state ('home', {
                url: '/home',
                templateUrl: '/views/home.html',
                /*resolve: {
                    loadPlugin: function($ocLazyLoad) {
                        return $ocLazyLoad.load ([
                            {
                                name: 'css',
                                insertBefore: '#app-level',
                                files: [
                                    '/library/bower_components/fullcalendar/dist/fullcalendar.min.css',
                                ]
                            },
                            {
                                name: 'library',
                                insertBefore: '#app-level-js',
                                files: [
                                    '/library/sparklines/jquery.sparkline.min.js',
                                    '/library/bower_components/jquery.easy-pie-chart/dist/jquery.easypiechart.min.js',
                                    '/library/bower_components/simpleWeather/jquery.simpleWeather.min.js'
                                ]
                            }
                        ])
                    }
                }*/
            })

    })
