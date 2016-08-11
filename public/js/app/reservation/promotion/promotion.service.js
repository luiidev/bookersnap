//angular.module('promotion.service', []);

angular.module('promotion.service', [])
.factory('PromotionFactory',function($http,ApiUrlReservation,ApiUrlGeneral){
  return {
    getLabel: function(vData){
      return $http.get(ApiUrlReservation+"/promotion/getlabel");
      //return $http.get(ApiUrlGeneral+"/promotions/flyers/labels"); 
    },
    getTypes: function(vData){
      return $http.get(ApiUrlGeneral+"/promotions/types"); 
    },
    getTypographys: function(vData){
      return $http.get(ApiUrlReservation+"/promotion/gettypographys");
      //return $http.get(ApiUrlGeneral+"/promotions/flyers/typographys"); 
    }
  };

})
.filter("maxLength", function(){
    return function(text,max){
        if(text != null){
            if(text.length > max){
                return "Texto a mostrar en el portal: <span class='text-red'>" + text.substring(3,max) + "</span>";
            }
        }
    }
})