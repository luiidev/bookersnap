angular.module('zone.directive', [])

.directive('ngDragTable', function($document, $window) {

  function makeDraggable(scope, element, attr, ctrl) {
    var startX = 0;
    var startY = 0;

    var x = 0;
    var y = 0;

    setTimeout(function() {

      x = element.attr("left");
      y = element.attr("top");

    }, 200);

    element.attr("top", y);
    element.attr("left", x);

    element.on('mousedown', function(event) {
      event.preventDefault();

      startX = event.pageX - x;
      startY = event.pageY - y;

      $document.on('mousemove', mousemove);
      $document.on('mouseup', mouseup);
    });


    element.on('click', function(event) {
      event.preventDefault();
      scope.onClickFn();
      angular.element(this).toggleClass("selected-table");

    });

    function mousemove(event) {

      var limitLienzo = getLimitLienzo(element.attr("shape"), element.attr("size"), element.attr("rotate"));

      var tmp_y = event.pageY - startY;
      var tmp_x = event.pageX - startX;

      //console.log("mousemove sizeElement " + JSON.stringify(limitLienzo));

      if (tmp_x <= limitLienzo.x && tmp_x >= limitLienzo.rx) {
        x = event.pageX - startX;
      }

      if (tmp_y <= limitLienzo.y && tmp_y >= limitLienzo.ry) {
        y = event.pageY - startY;
      }

      element.css({
        top: y + 'px',
        left: x + 'px'
      });

      /*element.attr("top",y);
      element.attr("left",x);*/
    }

    function getLimitLienzo(shape, sizeLabel, rotate) {
      var limit = {
        x: 610,
        y: 670,
        rx: 0,
        ry: 0
      };

      if (shape == "round" || shape == "square") {

        if (rotate == "0" && shape == "round" && sizeLabel == "small") {
          limit = {
            x: 629,
            y: 690,
            rx: 0,
            ry: 0
          };
          console.log("small round 0");
        }

        if (rotate == "45" && shape == "round" && sizeLabel == "small") {
          limit = {
            x: 622,
            y: 693,
            rx: 6,
            ry: 0
          };
          console.log("small round 45");
        }

        if (rotate == "0" && shape == "square" && sizeLabel == "small") {
          limit = {
            x: 629,
            y: 692,
            rx: 0,
            ry: 0
          };
          console.log("small square 0");
        }

        if (rotate == "45" && shape == "square" && sizeLabel == "small") {
          limit = {
            x: 623,
            y: 689,
            rx: 12,
            ry: 0
          };
          console.log("small square 45");
        }

        if (rotate == "45" && sizeLabel == "medium") {

          limit = {
            x: 607,
            y: 673,
            rx: 8,
            ry: 0
          };

          if (shape == "square") {
            limit = {
              x: 602,
              y: 664,
              rx: 17,
              ry: 0
            };
          }
          console.log("medium 45");
        }

        if (rotate == "0" && shape == "round" && sizeLabel == "large") {
          limit = {
            x: 585,
            y: 647,
            rx: 0,
            ry: 0
          };
          console.log("large round 0");
        }

        if (rotate == "45" && shape == "round" && sizeLabel == "large") {
          limit = {
            x: 589,
            y: 649,
            rx: 7,
            ry: 0
          };
          console.log("large round 45");
        }

        if (rotate == "0" && shape == "square" && sizeLabel == "large") {
          limit = {
            x: 585,
            y: 647,
            rx: 0,
            ry: 0
          };
          console.log("large square 0");
        }

        if (rotate == "45" && shape == "square" && sizeLabel == "large") {
          limit = {
            x: 577,
            y: 632,
            rx: 22,
            ry: 0
          };
          console.log("large square 0");
        }

      } else {

        limit = {
          x: 615,
          y: 695,
          rx: 0,
          ry: 0
        };

        if (rotate == "45" && sizeLabel == "small") {
          limit = {
            x: 613,
            y: 685,
            rx: 10,
            ry: 0
          };
          console.log("small recta 45");
        }

        if (rotate == "0" && sizeLabel == "medium") {
          limit = {
            x: 600,
            y: 689,
            rx: 1,
            ry: 0
          };
          console.log("medium recta 0");
        }

        if (rotate == "45" && sizeLabel == "medium") {
          limit = {
            x: 600,
            y: 675,
            rx: 10,
            ry: 1
          };
          console.log("medium recta 45");
        }

        if (rotate == "0" && sizeLabel == "large") {
          limit = {
            x: 585,
            y: 673,
            rx: 1,
            ry: 0
          };
          console.log("large recta 0");
        }

        if (rotate == "45" && sizeLabel == "large") {
          limit = {
            x: 580,
            y: 656,
            rx: 14,
            ry: 5
          };
          console.log("large recta 45");
        }

      }

      return limit;
    }

    function mouseup() {
      $document.unbind('mousemove', mousemove);
      $document.unbind('mouseup', mouseup);
    }
  }
  return {
    link: makeDraggable,
    //controller: 'ZoneCreateCtrl',
    scope: {
      onClickFn: '&'
    }
  };
});