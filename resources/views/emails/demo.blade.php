@extends('beautymail::templates.widgets')

@section('content')

    @include('beautymail::templates.widgets.articleStart')

        <h4 class="secondary" ><strong>{{ title }}</strong></h4>
        <p>{{ mensaje }}</p>

    @include('beautymail::templates.widgets.articleEnd')

@stop
