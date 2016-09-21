angular.module('form.directive', [])
    .directive('nextOnEnter', function() {
        function nextForm(scope, element, attr, ctrl) {

            element.bind('keydown', function(e) {
                var code = e.keyCode || e.which;
                if (code === 13) {
                    e.preventDefault();
                    var pageElems = document.querySelectorAll('input, select, textarea');
                    var elem = e.srcElement;
                    var focusNext = false;
                    var len = pageElems.length;
                    for (var i = 0; i < len; i++) {
                        var pe = pageElems[i];
                        if (focusNext) {
                            if (pe.style.display !== 'none') {
                                pe.focus();
                                break;
                            }
                        } else if (pe === e.srcElement) {
                            focusNext = true;
                        }
                    }
                }
            });

        }
        return {
            link: nextForm
        };

    });