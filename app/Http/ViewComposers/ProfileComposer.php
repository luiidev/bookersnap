<?php
/**
 * Created by PhpStorm.
 * User: BS
 * Date: 05/08/2016
 * Time: 18:37
 */

namespace App\Http\ViewComposers;


use Illuminate\View\View;

class ProfileComposer
{
    /**
     * The user repository implementation.
     *
     * @var UserRepository
     */
    //protected $users;

    /**
     * Create a new profile composer.
     *
     * @param  UserRepository  $users
     * @return void
     */
    public function __construct()
    {

    }

    /**
     * Bind data to the view.
     *
     * @param  View  $view
     * @return void
     */
    public function compose(View $view)
    {
        $view->with('user', \Auth::user()->toArray());
    }
}