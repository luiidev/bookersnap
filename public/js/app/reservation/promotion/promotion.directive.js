angular.module('promotion.directive', [])
.directive('ngDraggable', function($document, $window){
  function makeDraggable(scope, element, attr) {
    var startX = 0;
    var startY = 0;

    // Start with a random pos
    var x = Math.floor((Math.random() * 300) + 40);
    var y = Math.floor((Math.random() * 200) + 40);

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
})
.directive('ngSelectTable', function(){

  function makeSelectTable(scope, element, attr) {
    
    var left = attr.x;
    var top = attr.y;

    element.css({
      position: 'absolute',
      cursor: 'pointer',
      top: top + 'px',
      left: left + 'px',
    });


    element.on('click',function(event){

      event.preventDefault();

      if(this.classList.contains('definite-table')== true){
        //console.log('Desea eliminar precio precio de mesa');
        this.classList.remove('selected-table');
        scope.onDeselectFn();
      }else{
        
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
      onSelectedFn : '&',
      onDeselectFn : '&'
    }
  };

})