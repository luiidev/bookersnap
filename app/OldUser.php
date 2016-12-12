<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class OldUser extends Model {

    protected $connection = 'mysql_old';
    protected $table = 'usermicrosite';
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
//    protected $fillable = [
//        'name', 'email', 'password',
//    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password', 'remember_token',
    ];
}
