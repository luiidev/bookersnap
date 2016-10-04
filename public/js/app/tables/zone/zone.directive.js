angular.module('zone.directive', [])

.directive('ngDragTable', function() {

  function dragTable(scope, element, attr, ctrl) {

    element.on('click', function(event) {
      event.preventDefault();
      scope.onClickFn();

      angular.element('.item-drag-table').removeClass('selected-table');
      angular.element(this).toggleClass("selected-table");

    });

    var draggableWidth = element.context.offsetWidth;
    var parentWidth = angular.element('.lienzo').width();

    element.draggable({
      containment: "parent",
      grid: [10, 10],
      drag: function(event, ui) {
        element.attr("top", ui.position.top);
        element.attr("left", ui.position.left);

        console.log(parentWidth);

        //console.log("start " + angular.toJson(event, true));
        //element.draggable("disable");
      },
      start: function(event, ui) {
        //scope.onDragFn();
        angular.element('#lienzo').addClass('drag');
      },
      stop: function(event, ui) {
        angular.element('#lienzo').removeClass('drag');
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