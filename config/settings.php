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
	'API_AUTH_URL'  => 'http://localhost:100/v1',
	'API_ADMIN_URL' => 'http://localhost:90/v1',
	'API_PROMO_URL' => 'http://api-promotion.vh/v1',
	'MAIN_DOMAIN'   => 'weblaravel.studework.vm',
	
	'SYS_BOOKERSNAP'=> 'http://bookersnap.com',
	'STATUS_SESSION'=> '0', //1 activar, 0 desactivar, session del sistema de mesas	
	'API_URL' =>  'http://apimesas.studework.info/v1/es/microsites'
];
