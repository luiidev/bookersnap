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

    public function LoginBs(Request $request)
    {
        try {
            $timeExpire = 3600;
            $response  = $this->_authService->LoginBsUserData($request->input('email'), $request->input('password'), $timeExpire, $request->ip(), $request->server('HTTP_USER_AGENT'));

            if ($response) {
                $userData = $response["data"];
                $request->session()->put("token_session", $userData["token_session"]);

                Auth::loginUsingId($userData['user']["id"]);
                return response()->redirectTo('/admin/ms/1/mesas');
            }

            $response = redirect()->route('microsite-login')->with('error-message', 'Hubo un error al iniciar la sesión.')->withInput();
        } catch (HttpException $e) {
            $msg      = $e->getMessage();
            return $msg;
            $response = redirect()->route('microsite-login')->with('error-message', $msg);
        } catch (\Exception $e) {
            $msg      = 'Ocurrió un error interno.';
            return $e->getMessage();
            $response = redirect()->route('microsite-login')->with('error-message', $msg);
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
            $response  = $this->_authService->ValidateSocialResponse($request->input('response'));
            $userData  = $this->_authService->LoginSocialUserData($response->data);
            $user      = $userData['user'];
            $userlogin = $userData['userlogin'];
            $extras    = [
                'api-token'  => $userData['token'],
                'user-login' => [
                    $userlogin['bs_socialnetwork_id'] => $userlogin,
                ],
            ];

            if ($this->LoginUser($user['id'], $extras)) {
                $bsAuthToken = $this->generateBsAuthToken($user['id']);
                return response()->redirectTo($response->url)
                    ->with('message', 'Bienvenido Usuario.')
                    ->with("bsAuthToken", $bsAuthToken);
            }
            return redirect()->to($response->url)->with('error-message', 'Hubo un error al iniciar la sesión.');
        } catch (HttpException $e) {
            $msg = $e->getMessage();
            return redirect()->route('microsite-login')->with('error-message', $msg);
        } catch (\Exception $e) {
            //echo $e->getMessage()." ".$e->getFile()." ".$e->getLine();exit;
            $msg = 'Ocurrió un error interno.';
            return redirect()->route('microsite-login')->with('error-message', $msg);
        }
    }

    /**
     * Cambiar $route a la que va a quedar como ruta de login.
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function Logout(Request $request)
    {
        // return (string) $request->session()->get("token_session");
        return $this->_authService->logout( $request->session()->get("token_session"));
        $request->session()->forget(['token_session']);
        Auth::logout();

        return redirect()->route("microsite-login");

        // $request = request();
        // $this->LogoutUser();
        // $route = route('microsite-login');
        // if ($request->ajax() || $request->wantsJson()) {
        //     return $this->CreateJsonResponse(true, 200, null, null, true, $route);
        // }
        // return response()->redirectToRoute('microsite-home');
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
