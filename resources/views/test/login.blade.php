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

            <form method='post'>
                <input type="hidden" name="_token" value="{{ csrf_token()}}"/>
                <label>Email: <input type="text" name="email"/></label>
                <label>Password: <input type="text" name="password"/></label>
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