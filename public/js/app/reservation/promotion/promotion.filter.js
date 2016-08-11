angular.module('promotion.filter', [])
.filter("maxLength", function(){
    return function(text,max){
        if(text != null){
            if(text.length > max){
                return "Texto a mostrar en el portal: <span class='text-red'>" + text.substring(3,max) + "</span>";
            }
        }
    }
})
.filter("toUpper", function(){
    return function(text){
        if(text != null){
            return text.toUpperCase();
        }
    }
})
.filter("diaSemana", function(){
    return function(num) {
        if(num != null){
            var day = "";
            switch(num) {
              case 0:
              day = "Domingo";
              break;
              case 1:
              day = "Lunes";
              break;
              case 2:
              day = "Martes";
              break;
              case 3:
              day = "Miercoles";
              break;
              case 4:
              day = "Jueves";
              break;
              case 5:
              day = "Viernes";
              break;
              case 6:
              day = "Sabado";
              break;
            }
            return day;
        }
    }
})