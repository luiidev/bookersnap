angular.module("bookersnap.services", [])
    .factory('MenuConfigFactory', function($timeout) {
        return {
            menuActive: function(index) {

                $timeout(function() {
                    angular.element("#menu-config li").removeClass("active");
                    angular.element("#menu-config li").eq(index).addClass("active");
                }, 500);

            }
        };

    })
    .factory('HttpFactory', function($http) {
        return {
            get: function(httpUrl, config, objectData, reload) {

                if (reload === true) objectData = null;
                if (objectData) return objectData;

                return $http.get(httpUrl, config);

            }
        };
    })
    .factory('ServerNotification', function(UrlServerNotify, $http) {
        var serverConnection;
        return {
            createConnection: function() {
                if (serverConnection) {
                    console.log("existe serverConnection");
                    return serverConnection;
                }
                try {
                    serverConnection = io.connect(UrlServerNotify);
                } catch (err) {
                    console.log("error conexion realtime", err);
                }

                console.log(serverConnection);

                return serverConnection;
            },
            createRoom: function(room) {
                //var roomJwt = JwtKey.generated();
                //var roomJwt = $http.defaults.headers.common['Authorization'];
                serverConnection.emit("create-room-micrositio", room);
            },
            getConnection: function() {
                return serverConnection;
            }
        };
    })
    .factory('JwtKey', function(IdMicroSitio) {

        return {
            generated: function() {
                // Header
                var oHeader = {
                    alg: 'HS256',
                    typ: 'JWT'
                };
                // Payload
                var oPayload = {};
                var tNow = KJUR.jws.IntDate.get('now');
                var tEnd = KJUR.jws.IntDate.get('now + 1day');
                //oPayload.iss = "http://foo.com";
                //oPayload.sub = "mailto:mike@foo.com";
                oPayload.nbf = tNow;
                oPayload.iat = tNow;
                oPayload.exp = tEnd;
                oPayload.jti = "id123456";

                oPayload.micro = IdMicroSitio;
                // Sign JWT, password=616161
                var sHeader = JSON.stringify(oHeader);
                var sPayload = JSON.stringify(oPayload);
                var sJWT = KJUR.jws.JWS.sign("HS256", sHeader, sPayload, "616161");

                console.log("generated " + angular.toJson(sJWT, true));
                return sJWT;

            }
        };
    });