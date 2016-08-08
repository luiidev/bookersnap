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

class ApiRequestsHelper
{

    public static function SendRequest(string $method, string $url, array $credentials = null, $data)
    {
        $response = null;
        $client = new Client();
        $json = json_encode($data);
        $headers = [
            'content-type' => 'application/json'
        ];
        if (!is_null($credentials)) {
            foreach ($credentials as $key => $value) {
                $headers[$key] = $value;
            }
        }
        try {
            $res = $client->request($method, $url, [
                'headers' => $headers,
                'body' => $json
            ]);
            $response = (string)$res->getBody();
        } catch (RequestException $e) {
            $response = (string)$e->getResponse()->getBody();
        } catch (\Exception $e) {
            abort(500, 'Ocurrió un error interno.');
        }
        return json_decode($response, true);
    }
}