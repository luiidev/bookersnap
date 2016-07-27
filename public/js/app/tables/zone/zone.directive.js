angular.module('zone.directive', [])

.directive('ngDragTable', function($document, $window){

  function makeDraggable(scope, element, attr,ctrl) {
    var startX = 0;
    var startY = 0;

    /*var x = Math.floor((Math.random() * 500) + 40);
    var y = Math.floor((Math.random() * 360) + 40);*/

    var x = 0;
    var y = 0;

    //if (element.attr("option") == "edit") {

    setTimeout(function(){

      x =  element.attr("left");
      y =  element.attr("top");

    },200);

    //}
 
   /* element.css({
      position: 'absolute',
      cursor: 'move',
      top: y + 'px',
      left: x + 'px'
    });*/

    element.attr("top",y);
    element.attr("left",x);

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

      var limitLienzo = getLimitLienzo(element.attr("shape"),element.attr("size"),element.attr("rotate"));

      var tmp_y = event.pageY - startY;
      var tmp_x = event.pageX - startX;

      //console.log("mousemove sizeElement " + JSON.stringify(limitLienzo));
      
      if(tmp_x <= limitLienzo.x && tmp_x >= limitLienzo.rx){
        x = event.pageX - startX;
      }

      if(tmp_y <= limitLienzo.y && tmp_y >= limitLienzo.ry){
        y = event.pageY - startY;
      }

      element.css({
        top: y + 'px',
        left: x + 'px'
      });

      /*element.attr("top",y);
      element.attr("left",x);*/
    }

    function getLimitLienzo(shape,sizeLabel,rotate){
      var limit = {x : 756, y : 670,rx : 0,ry: 0};

      if (shape == "round" || shape == "square") {

        if(rotate == "0" && shape == "round" && sizeLabel == "small" ){
          limit = {x : 774, y : 690,rx : 0,ry: 0};
          console.log("small round 0");
        }

        if(rotate == "45" && shape == "round" && sizeLabel == "small" ){
          limit = {x : 770, y : 693,rx : 6,ry: 0};
          console.log("small round 45");
        }

        if(rotate == "0" && shape == "square" && sizeLabel == "small" ){
          limit = {x : 774, y : 692,rx : 0,ry: 0};
          console.log("small square 0");
        }

        if(rotate == "45" && shape == "square" && sizeLabel == "small" ){
          limit = {x : 772, y : 689,rx : 12,ry: 0};
          console.log("small square 45");
        }

        if(rotate == "45"  && sizeLabel == "medium" ){

          limit = {x : 775, y : 673,rx : 8,ry: 0};

          if( shape == "square"){
            limit = {x : 770, y : 664,rx : 17,ry: 0};
          }
          console.log("medium 45");
        }

        if(rotate == "0" && shape == "round" && sizeLabel == "large" ){
          limit = {x : 730, y : 647,rx : 0,ry: 0};
          console.log("large round 0");
        }

        if(rotate == "45" && shape == "round" && sizeLabel == "large" ){
          limit = {x : 750, y : 649,rx : 7,ry: 0};
          console.log("large round 45");
        }

        if(rotate == "0" && shape == "square" && sizeLabel == "large" ){
          limit = {x : 730, y : 647,rx : 0,ry: 0};
          console.log("large square 0");
        }

        if(rotate == "45" && shape == "square" && sizeLabel == "large" ){
          limit = {x : 740, y : 632,rx : 22,ry: 0};
          console.log("large square 0");
        }

      }else{

        limit = {x : 780, y : 695,rx : 0,ry : 0};

        if(rotate == "45" && sizeLabel == "small"){
          limit = {x : 780, y : 685,rx : 10,ry : 0};
          console.log("small recta 45");
        }

        if(rotate == "0" && sizeLabel == "medium"){
          limit = {x : 764, y : 689,rx : 1,ry : 0};
          console.log("medium recta 0");
        }

        if(rotate == "45" && sizeLabel == "medium"){
          limit = {x : 764, y : 675,rx : 10,ry : 0};
          console.log("medium recta 45");
        }

        if(rotate == "0" && sizeLabel == "large"){
          limit = {x : 750, y : 673,rx : 1,ry : 0};
          console.log("large recta 0");
        }

        if(rotate == "45" && sizeLabel == "large"){
          limit = {x : 750, y : 656,rx : 14,ry : 5};
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
    	onClickFn :  '&'
    }
  };
});