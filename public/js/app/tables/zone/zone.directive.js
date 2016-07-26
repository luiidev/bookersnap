angular.module('zone.directive', [])

.directive('ngDragTable', function($document, $window){

  function makeDraggable(scope, element, attr,ctrl) {
    var startX = 0;
    var startY = 0;

    var x = Math.floor((Math.random() * 500) + 40);
    var y = Math.floor((Math.random() * 360) + 40);

   /* var x = element.attr("left");
    var y = element.attr("top");*/

    if (element.attr("option") == "edit") {

      setTimeout(function(){

        x =  element.attr("left");
        y =  element.attr("top");

        console.log("x - y" , x ," - ", y);
      },1000);

    }
 
    element.css({
      position: 'absolute',
      cursor: 'move',
      top: y + 'px',
      left: x + 'px'
    });

    /*element.attr("top",y);
    element.attr("left",x);*/

    element.on('mousedown', function(event) {
      event.preventDefault();
      
      startX = event.pageX - x;
      startY = event.pageY - y;

      $document.on('mousemove', mousemove);
      $document.on('mouseup', mouseup);

    });


    element.on('click',function(event){
    	
    	event.preventDefault();

    	scope.onClickFn();
    
    	if (this.classList.contains('selected-table')) {

    		this.classList.remove('selected-table');
    		
    	} else {

    	    //ctrl.alertaPrueba();no-sirve-para-renderizar-scope

    		angular.element('.item-drag-table').removeClass('selected-table');

    		this.classList.add('selected-table');
    	}
    })

    function mousemove(event) {
      y = event.pageY - startY;
      x = event.pageX - startX;
      
      element.css({
        top: y + 'px',
        left: x + 'px'
      });

      /*element.attr("top",y);
      element.attr("left",x);*/
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
    	onClickFn :  '&'
    }
  };
});