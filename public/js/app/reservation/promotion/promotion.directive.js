angular.module('promotion.directive', [])
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
      //console.log("Test");
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