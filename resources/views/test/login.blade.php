<div>

    @if(session('error-message')!==null)
        <div>
            <h3>Errores:</h3>
            {{session('error-message')}}
        </div>
    @endif

    @if(session('message')!==null)
        <div>
            <h3>Mensaje:</h3>
            {{session('message')}}
        </div>
    @endif

    @if(!Auth::check())
        <div>
            <h3>Login with bookersnap</h3>

            <form method='post' action="">
                <input type="hidden" name="_token" value="{{ csrf_token()}}"/>
                <label>Email: <input type="text" name="email" value="{{old('email')}}"/></label>
                <label>Password: <input type="password" name="password"/></label>
                <button>Login</button>
            </form>
        </div>

        <div>
            <h3>Login with facebook</h3>

            <form action="auth/social" method='post'>
                <input type="hidden" name="_token" value="{{ csrf_token()}}"/>
                <input type="hidden" name="_sn" value="1"/>
                <button>Login</button>
            </form>
        </div>

        <div>
            <h3>Login with twitter</h3>

            <form action="auth/social" method='post'>
                <input type="hidden" name="_token" value="{{ csrf_token()}}"/>
                <input type="hidden" name="_sn" value="2"/>
                <button>Login</button>
            </form>
        </div>

        <div>
            <h3>Login with google</h3>

            <form action="auth/social" method='post'>
                <input type="hidden" name="_token" value="{{ csrf_token()}}"/>
                <input type="hidden" name="_sn" value="3"/>
                <button>Login</button>
            </form>
        </div>
    @else
        Bienvenido asdasdsad!
    @endif


</div>

<script src="/library/bower_components/jquery/dist/jquery.min.js"></script>

<script src="/library/cross-domain-local-storage-2.0.3/dist/scripts/xdLocalStorage.min.js"></script>
{{--auth--}}
@if(session('bsAuthToken'))
    <script src="/library/bookersnap/auth/ss_set.js"></script>
    <script>fn_ss_set(xdLocalStorage, "{{session('bsAuthToken')}}");</script>
@elseif(Auth::check())
    <script src="/library/bookersnap/auth/ss_in.js"></script>
@else
    <script src="/library/bookersnap/auth/ss_out.js"></script>
@endif
