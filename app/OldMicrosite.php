<?php
namespace App;

use Illuminate\Database\Eloquent\Model;

class OldMicrosite extends Model {

    protected $connection = 'mysql_old';
    protected $table = 'microsite';
    public $timestamps = false;

    
}

