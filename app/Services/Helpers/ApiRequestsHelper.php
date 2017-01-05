<?php
/**
 * Created by PhpStorm.
 * User: BS
 * Date: 05/08/2016
 * Time: 13:12
 */

namespace App\Services\Helpers;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;
use GuzzleHttp\Exception\RequestException;
use Session;

class ApiRequestsHelper
{

    public static function SendRequest(string $method, string $url, array $headers = null, $data = null)
    {
        $response = null;
        $client = new Client();
        $json = (is_null($data) ? null : json_encode($data));
        $http_headers = [
            'content-type' => 'application/json'
        ];
        if (!is_null($headers)) {
            foreach ($headers as $key => $value) {
                $http_headers[$key] = $value;
            }
        }
        $request = request();
        $http_headers['user-agent'] = $request->server('HTTP_USER_AGENT');
        $api_token = $request->session()->get('api-token');
        if (!is_null($api_token)) {
            $http_headers['Authorization'] = 'Bearer ' . $api_token;
        }

        try {
            $res = $client->request($method, $url, [
                'headers' => $http_headers,
                'body' => $json
            ]);
            $response = (string)$res->getBody();
        } catch (RequestException $e) {
            if ($e->getResponse() == null) {
                throw new \Exception('Servidor no responde');
            }
            $response = (string)$e->getResponse()->getBody();
        } catch (\Exception $e) {
            abort(500, 'Ocurrió un error interno :).');
        }
        return json_decode($response, true);
    }
}