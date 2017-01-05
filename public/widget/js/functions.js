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

var obtenerIdMicrositio = function() {
    var url = location.href;
    var pos = url.indexOf("/w/");
    var id = url.substr(pos + 3);
    var last_pos = id.indexOf("/");
    id = id.substr(0, last_pos);
    return id;
};