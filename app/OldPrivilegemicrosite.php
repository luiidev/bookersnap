<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class OldPrivilegemicrosite extends Model {

    protected $connection = 'mysql_old';
    protected $table = 'privilegemicrosite';
    public $timestamps = false;
    
}
