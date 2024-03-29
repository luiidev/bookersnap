<?php

//define('API_MESAS_URL', 'http://api-mesas.vh');

/*
return array(
'api.mesas.url' => 'http://api-mesas.vh',
'api.reservaciones.url' => '',
);*/

//define('API_AUTH_URL', 'http://localhost:3001/v1');
//define('API_ADMIN_URL', 'http://localhost:3000/v1');

//define('API_AUTH_URL', 'http://localhost:3001/v1');
//define('API_ADMIN_URL', 'http://localhost:3000/v1');
//define('API_PROMO_URL', 'http://api-promotion.vh/v1');

// para usar la constante usar: config('settings.NOMBRE_CONSTANTE')
return [
	'API_AUTH_URL'  => env("API_AUTH_URL",'http://apiauth.studework.vm/v1'),
	'API_ADMIN_URL' => env("API_ADMIN_URL",'http://apiadmin.studework.vm/v1'),
	'API_PROMO_URL' => env("API_PROMO_URL",'http://apipromociones.studework.vm/v1'),
	'MAIN_DOMAIN'   => env("MAIN_DOMAIN", 'weblaravel.studework.vm'),

	'SYS_BOOKERSNAP'=> env("SYS_BOOKERSNAP", 'http://reservantro.com'),
	'STATUS_SESSION'=> env("STATUS_SESSION",'0'), //1 activar, 0 desactivar, session del sistema de mesas	
	'API_URL' =>  env("API_URL", 'http://apimesas.studework.vm/v1/es/microsites'),
	'TIME_EXPIRE_SESSION' => 604800
];