/**
 * Created by BS on 12/08/2016.
 */

angular.module('master.app',
    [
        'category.app',
        'microsite.app',
        'microportal.app',
        'role.app'
    ]);

angular.module('bookersnap', ['master.app']);