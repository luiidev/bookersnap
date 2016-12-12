<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class OldPrivilege extends Model {

    protected $connection = 'mysql_old';
    protected $table = 'privilege';
    public $timestamps = false;
    
}