/**
 * Created by BS on 12/08/2016.
 */
angular.module('microsite.controller', ['bsLoadingOverlay'])
    .run(function (bsLoadingOverlayService) {
        bsLoadingOverlayService.setGlobalConfig({
            delay: 0, // Minimal delay to hide loading overlay in ms.
            activeClass: undefined, // Class that is added to the element where bs-loading-overlay is applied when the overlay is active.
            templateUrl: 'overlay-template.html', // Template url for overlay element. If not specified - no overlay element is created.
            templateOptions: undefined // Options that are passed to overlay template (specified by templateUrl option above).
        });
    })
    //----------------------------------------------
    // LISTA MICROSITIOS
    //----------------------------------------------
    .controller('MicrositeListController', function () {

    })
    //----------------------------------------------
    // CREAR MICROSITIOS
    //----------------------------------------------
    .controller('MicrositeCreateController', function () {

    })