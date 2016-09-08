<script src="/library/bookersnap/auth/logout.js"></script>
{{--Este script es importante para comunicarse con el localstorage del dominio en comun--}}
<script src="/library/cross-domain-local-storage-2.0.3/dist/scripts/xdLocalStorage.min.js"></script>
{{--auth--}}
@if(session('bsAuthToken'))
    {{--Estos scripts se agregan cuando se acaba de iniciar la sesion y se envia la variable de sesion flash bsAuthToken--}}
    {{--Sirven para setear el token (que servira para compartir la sesion entre todos los dominios) en el session storage--}}
    {{--del dominio en comun.--}}
    <script src="/library/bookersnap/auth/ss_set.js"></script>
    <script>fn_ss_set(xdLocalStorage, "{{session('bsAuthToken')}}");</script>
@elseif(Auth::check())
    {{--en caso de que la sesion exista y cuando se acaba de iniciar la sesion, se agrega este script, que preguntara al --}}
    {{--local storage si existe el item "_sharedSession", si no existe enviará una petición para cerrar la session instantaneamente.--}}
    <script src="/library/bookersnap/auth/ss_in.js"></script>
@else
    {{--En caso de que no exista sesion alguna, se carga este script que consultara al local storage si existe el item--}}
    {{--"_sharedSession", de existir, realizara una solicitud para iniciar sesion en el dominio enviando el token como parametro--}}
    {{--y recargara la pagina.--}}
    <script src="/library/bookersnap/auth/ss_out.js"></script>
@endif
