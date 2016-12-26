$(document).ready(function() {
    $(".header:not(.search)").on("click", function() {

        var body = $(this).parent().find(".body");

        var active = $($.grep($(".row .body"), function(element) {
          return $(element).hasClass("active");
        }));

        if ( !body.is(active) ) {
                body.addClass("active", 200);
                active.removeClass("active", 200);
        }
    });
});