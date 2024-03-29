angular.module('block.directive', [])
  .directive('ngSelectTable', function() {

    function makeSelectTable(scope, element, attr) {

      var left = attr.x;
      var top = attr.y;

      element.css({
        position: 'absolute',
        cursor: 'pointer',
        top: top + 'px',
        left: left + 'px',
      });
      element.on('click', function(event) {

        event.preventDefault();
        if (this.classList.contains('selected-table') === true) {
          this.classList.remove('selected-table');
          scope.onDeselectFn();
        } else {
          if (this.classList.contains('selected-table')) {
            this.classList.remove('selected-table');
          } else {
            this.classList.add('selected-table');
          }
          scope.onSelectedFn();
        }

      });
    }

    return {
      link: makeSelectTable,
      scope: {
        onSelectedFn: '&',
        onDeselectFn: '&'
      }
    };

  });