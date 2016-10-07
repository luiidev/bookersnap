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

        //Left

        if (draggableRight >= parentWidth && eRotate == "0") {
          if (eTextRotate == "right") {
            angular.element(eLabel.context.lastElementChild).removeClass("right");
            angular.element(eLabel.context.lastElementChild).addClass("left");
          }
        } else {
          if (eTextRotate == "top" && eRotate == "45" && draggableRight >= (parentWidth - draggableWidth * 0.35)) {
            angular.element(eLabel.context.lastElementChild).removeClass("top");
            angular.element(eLabel.context.lastElementChild).addClass("left");
          }
          if (eTextRotate == "right" && eRotate == "45" && draggableRight >= (parentWidth - draggableWidth * 0.35)) {
            angular.element(eLabel.context.lastElementChild).removeClass("right");
            angular.element(eLabel.context.lastElementChild).addClass("bottom");
          }
        }

        if (draggableLeft <= 0 && eRotate == "0") {
          if (eTextRotate == "left") {
            angular.element(eLabel.context.lastElementChild).removeClass("left");
            angular.element(eLabel.context.lastElementChild).addClass("right");
          }

        } else {
          if (eTextRotate == "left" && eRotate == "45" && (draggableLeft - draggableWidth * 0.35) <= 0) {
            console.log("45 left");
            angular.element(eLabel.context.lastElementChild).removeClass("left");
            angular.element(eLabel.context.lastElementChild).addClass("top");
          }
          if (eTextRotate == "bottom" && eRotate == "45" && (draggableLeft - draggableWidth * 0.35) <= 0) {
            angular.element(eLabel.context.lastElementChild).removeClass("bottom");
            angular.element(eLabel.context.lastElementChild).addClass("right");
          }
        }

        //Top

        if (draggableTop <= 0 && eRotate == "0") {
          if (eTextRotate == "top") {
            angular.element(eLabel.context.lastElementChild).removeClass("top");
            angular.element(eLabel.context.lastElementChild).addClass("bottom");
          }
        }

        if ((draggableTop + draggableHeight) >= parentHeight && eRotate == "0") {
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