<?php

namespace App\Http\Controllers\Test;

use App\Services\AuthService;
use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Config;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    protected $_authService;

    public function __construct(AuthService $authService)
    {
        $this->_authService = $authService;
    }

    public function Index()
    {

        return view('test.login');
    }

    public function Home()
    {
        return view('test.home');
    }

    public function LoginBs()
    {
        try {
            $request = request();
            $userData = $this->_authService->LoginBsUserData($request->input('email'), $request->input('password'));
            $user = $userData['user'];
            $userlogin = $userData['userlogin'];
            $extras = [
                'api-token' => $userData['token'],
                'user-login' => [
                    $userlogin['bs_socialnetwork_id'] => $userlogin
                ]
            ];
            if ($this->LoginUser($user['id'], $extras)) {
                return response()->redirectTo(route('microsite-home'))->with('message', 'Bienvenido Usuario.')->withInput();
            }
            $response = redirect()->route('microsite-login')->with('error-message', 'Hubo un error al iniciar la sesión.');
        } catch (HttpException $e) {
            $msg = $e->getMessage();
            $response = redirect()->route('microsite-login')->with('error-message', $msg);
        } catch (\Exception $e) {
            $msg = 'Ocurrió un error interno.';
            $response = redirect()->route('microsite-login')->with('error-message', $msg);
        }

        return $response->withInput();
    }

    public function RedirectSocialLogin()
    {
        $request = request();
        $secutiryToken = str_random(25);
        $socialNetwork = $request->input('_sn');
        $urlSocialNetworkApi = Config::get("constants.url.api.social");
        $redirectTo = urlencode($this->getPreviousRoute());
        switch ($socialNetwork) {
            case 1:
                $url = $urlSocialNetworkApi . '/facebook';
                break;
            case 2:
                $url = $urlSocialNetworkApi . '/twitter';
                break;
            case 3:
                $url = $urlSocialNetworkApi . '/google';
                break;
            default:
                return response()->json(['denied']);
                break;
        }
        $callbackUrl = route("social-callback");

        $request->session()->flash('securitySocialLoginToken', $secutiryToken);
        $url .= "/auth?redirectTo=$redirectTo&callback=$callbackUrl&securityToken=$secutiryToken";
        return response()->redirectTo($url);
    }

    public function CallbackSocialLogin(Request $request)
    {
        try {
            $response = $this->_authService->ValidateSocialResponse($request->input('response'));
            $userData = $this->_authService->LoginSocialUserData($response->data);
            $user = $userData['user'];
            $userlogin = $userData['userlogin'];
            $extras = [
                'api-token' => $userData['token'],
                'user-login' => [
                    $userlogin['bs_socialnetwork_id'] => $userlogin
                ]
            ];
            if ($this->LoginUser($user['id'], $extras)) {
                return response()->redirectTo($response->url)->with('message', 'Bienvenido Usuario.');
            }
            return redirect()->route($response->url)->with('error-message', 'Hubo un error al iniciar la sesión.');
        } catch (HttpException $e) {
            $msg = $e->getMessage();
            return redirect()->route('microsite-login')->with('error-message', $msg);
        } catch (\Exception $e) {
            $msg = 'Ocurrió un error interno.';
            return redirect()->route('microsite-login')->with('error-message', $msg);
        }
    }

    public function Logout()
    {
        $this->LogoutUser();
        return response()->redirectToRoute('microsite-home');
    }

    //---------------------------------------
    // PRIVATE FUNCTIONS
    //---------------------------------------

    private function getPreviousRoute()
    {
        $route = \URL::previous();
//        if ($route == route("logoutRoute")) {
//            $route = "/";
//        }
        return $route;
    }

    private function LoginUser(int $id_user, array $extras)
    {
        $request = request();
        try {
            Auth::loginUsingId($id_user);
            foreach ($extras as $k => $v) {
                $request->session()->put($k, $v);
            }
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    private function LogoutUser()
    {
        $request = request();
        $request->session()->forget(['user-login', 'api-token']);
        Auth::logout();
    }

}
