<?php

namespace App\Http\Controllers\Test;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
use App\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Input;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Carbon\Carbon;

class AuthController extends Controller
{

    protected $redirectTo = '/auth/home';
    protected $redirectAfterLogout = '/auth/auth';
    
    // protected $guard = 'admin';

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

    public function email(Request $request)
    {
        \Session::reflash();
        return view("test.email_required");
    }

    public function LoginBs(Request $request)
    {
        try {
            $response  = $this->_authService->LoginBsUserData(
                $request->input('email'), 
                $request->input('password'),
                $request->server("HTTP_USER_AGENT"),
                $request->ip(),
                config("settings.TIME_EXPIRE_SESSION")
            );

            if ($response) {
                $userData = $response["data"];
                $request->session()->put("token_session", $userData["token_session"]);

                return response()->redirectTo('/admin/ms/1/mesas');
            }

            $response = redirect()->route('microsite-login')->with('error-message', 'Usuario y/o contraseña incorrecta.')->withInput();
        } catch (HttpException $e) {
            $response = redirect()->route('microsite-login')->with('error-message', $e->getMessage());
        } catch (\Exception $e) {
            $response = redirect()->route('microsite-login')->with('error-message', 'Ocurrió un error interno.');
        }

        return $response->withInput();
    }

    public function RedirectSocialLogin()
    {
        $request             = request();
        $secutiryToken       = str_random(25);
        $socialNetwork       = $request->input('_sn');
        $urlSocialNetworkApi = Config::get("constants.url.api.social");
        $redirectTo          = urlencode($this->getPreviousRoute());
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
            $social_req = $request->input('response');
            $social_req = $social_req ? $social_req :$request->old('response');
            $response  = $this->_authService->ValidateSocialResponse($social_req);

            if (is_null($response->data->user->email)) {

                if (is_null($request->email)) {
                    $request->flash();
                    return redirect()->route("microsite-email");
                } else {
                    $response->data->user->email = $request->email;
                }
            }

            $userAgent = $request->server("HTTP_USER_AGENT");
            $client_ip = $request->ip();
            $time_expire =  config("settings.TIME_EXPIRE_SESSION");

            $userData  = $this->_authService->LoginSocialUserData($response->data, $userAgent, $client_ip, $time_expire);

            $request->session()->put("token_session", $userData["data"]["token_session"]);

            return response()->redirectTo('/admin/ms/1/mesas');
        } catch (HttpException $e) {
            return redirect()->route('microsite-login')->with('error-message', $e->getMessage());
        } 
        // catch (\Exception $e) {
        //     return redirect()->route('microsite-login')->with('error-message', 'Ocurrió un error interno.');
        // }
    }

    /**
     * Cambiar $route a la que va a quedar como ruta de login.
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function Logout(Request $request)
    {
        $this->_authService->logout();
        $request->session()->forget(['token_session']);
        Auth::logout();

        return redirect()->route("microsite-login");
    }

    public function loginBySharedToken(Request $req)
    {
        $bsAuthToken  = $req->input('_authToken');
        $decodedToken = json_decode(\Crypt::decrypt($bsAuthToken), true);
        try {
            $result = $this->_authService->CheckBsAuthToken($decodedToken['id'], $decodedToken['key']);
            
            if ($result) {
                $req->session()->set('login_web_59ba36addc2b2f9401580f014c7f58ea4e30989d', $decodedToken['id']);
                $req->session()->set('user-login', $decodedToken['user-login']);
                $req->session()->set('api-token', $decodedToken['api-token']);
                return $this->CreateJsonResponse(true, 200);
            }
        } catch (HttpException $e) {
            return $this->CreateJsonResponse(false, 400, null, null, false, null, $e->getMessage(), $e->getMessage() . '\n' . '{$e->getFile()}: {$e->getLine()}');
        } catch (\Exception $e) {
            return $this->CreateJsonResponse(false, 500, null, null, false, null, 'Ocurrió un error interno', $e->getMessage() . '\n' . '{$e->getFile()}: {$e->getLine()}');
        }
    }

    public function removeSharedToken(Request $req)
    {
        $bsAuthToken  = $req->input("_authToken");
        $decodedToken = json_decode(\Crypt::decrypt($bsAuthToken), true);
        try {
            $result = $this->_authService->removeBsAuthToken($decodedToken["id"], $decodedToken["key"]);
            if ($result) {
                return $this->CreateJsonResponse(true, 200);
            }
        } catch (HttpException $e) {
            return $this->CreateJsonResponse(false, 400, null, null, false, null, $e->getMessage(), $e->getMessage() . "\n" . "{$e->getFile()}: {$e->getLine()}");
        } catch (\Exception $e) {
            return $this->CreateJsonResponse(false, 500, null, null, false, null, "Ocurrió un error interno", $e->getMessage() . "\n" . "{$e->getFile()}: {$e->getLine()}");
        }
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

    /**
     * @param bs_user $bs_user
     * @return string
     */
    private function generateBsAuthToken(int $bs_user_id)
    {
        $request  = request();
        $session  = $request->session();
        $tokenKey = str_random(10);
        $this->_authService->saveSharedLoginToken($bs_user_id, $tokenKey, $request->server("HTTP_USER_AGENT"));
        $token = ['id' => $bs_user_id, 'user-login' => $session->get('user-login')
            , 'api-token' => $session->get('api-token'), 'key' => $tokenKey];
        $bsAuthToken = Crypt::encrypt(json_encode($token));
        return $bsAuthToken;
    }

}
