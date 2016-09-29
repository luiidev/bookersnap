angular.module('zone.directive', [])

.directive('ngDragTable', function() {

  function dragTable(scope, element, attr, ctrl) {

    element.on('click', function(event) {
      event.preventDefault();
      scope.onClickFn();

      angular.element('.item-drag-table').removeClass('selected-table');
      angular.element(this).toggleClass("selected-table");

    });

    element.draggable({
      containment: "parent",
      grid: [10, 10],
      drag: function(event, ui) {
        element.attr("top", ui.position.top);
        element.attr("left", ui.position.left);
      },
      start: function() {
        //scope.onDragFn();
        //angular.element('.item-drag-table').removeClass('selected-table');
      }
    });
  }

  return {
    link: dragTable,
    scope: {
      onClickFn: '&',
      onDragFn: '&'
    }
  };
});