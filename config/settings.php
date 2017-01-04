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
    'API_AUTH_URL'  => 'http://apiauth.studework.vm/v1',
    'API_ADMIN_URL' => 'http://apiadmin.studework.vm/v1',
    'API_PROMO_URL' => 'http://apipromotion.studework.vm/v1',
    'MAIN_DOMAIN'   => 'weblaravel.studework.vm',
    'API_URL' =>  'http://apimesas.studework.com/v1/es/microsites'
];
