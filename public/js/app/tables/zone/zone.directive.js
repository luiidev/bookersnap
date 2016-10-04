angular.module('zone.directive', [])

.directive('ngDragTable', function() {

  function dragTable(scope, element, attr, ctrl) {

    element.on('click', function(event) {
      event.preventDefault();
      scope.onClickFn();

      angular.element('.item-drag-table').removeClass('selected-table');
      angular.element(this).toggleClass("selected-table");

    });


    var parentWidth = angular.element('.lienzo').width();
    var parentHeight = angular.element('.lienzo').height();
    element.draggable({
      containment: "parent",
      grid: [10, 10],
      drag: function(event, ui) {
        element.attr("top", ui.position.top);
        element.attr("left", ui.position.left);

        var draggableWidth = element.context.offsetWidth;
        var draggableHeight = element.context.offsetHeight;

        var draggableRight = ui.position.left + draggableWidth;
        var draggableLeft = ui.position.left;
        var draggableTop = ui.position.top;

        var eRotate = element.attr("rotate");
        var eLabel = angular.element(element.context);
        var eTextRotate = eLabel.context.lastElementChild.classList[1];

        console.log(eTextRotate);

        scope.onDragFn();

        //Left

        if (draggableRight >= parentWidth) {
          if (eTextRotate == "right") {
            angular.element(eLabel.context.lastElementChild).removeClass("right");
            angular.element(eLabel.context.lastElementChild).addClass("left");
          }
        }

        if (draggableLeft <= 0) {
          if (eTextRotate == "left") {
            angular.element(eLabel.context.lastElementChild).removeClass("left");
            angular.element(eLabel.context.lastElementChild).addClass("right");
          }
        }

        //Top
        console.log("draggableTop ", draggableTop);
        if (draggableTop <= 0) {
          if (eTextRotate == "top") {
            angular.element(eLabel.context.lastElementChild).removeClass("top");
            angular.element(eLabel.context.lastElementChild).addClass("bottom");
          }
        }

        if ((draggableTop + draggableHeight) >= parentHeight) {
          if (eTextRotate == "bottom") {
            angular.element(eLabel.context.lastElementChild).removeClass("bottom");
            angular.element(eLabel.context.lastElementChild).addClass("top");
          }
        }

        //element.draggable("disable");
      },
      start: function(event, ui) {
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