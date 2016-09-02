angular.module('flyer.directive', [])
.directive('ngDraggable', function($document, $window){
  function makeDraggable(scope, element, attr) {

    
    var startX = 0;
    var startY = 0;

    //var x = 0;
    //var y = 0;
    
    //setTimeout(function(){
      
      var x = element[0].querySelector(".etiqueta").offsetLeft;
      var y = element[0].querySelector(".etiqueta").offsetTop;

      //console.log(x,y);
    //},200);

     element.css({
      position: 'absolute',
      cursor: 'pointer',
      top: y + 'px',
      left: x + 'px'
    });


    element.on('mousedown', function(event) {
      event.preventDefault();
      
      startX = event.pageX - x;
      startY = event.pageY - y;

      $document.on('mousemove', mousemove);
      $document.on('mouseup', mouseup);
    });

    function mousemove(event) {
      y = event.pageY - startY;
      x = event.pageX - startX;

      element.css({
        top: y + 'px',
        left: x + 'px'
      });
    }

    function mouseup() {
      $document.unbind('mousemove', mousemove);
      $document.unbind('mouseup', mouseup);
    }
  }
  return {
    link: makeDraggable
  };
});