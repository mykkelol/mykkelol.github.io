/* global $ */

// scroll animation
$(document).ready(function(){
    
    // call onScroll
    $(document).on("scroll", onScroll);

    // identify location of header
    var headerLocation = $('.header').outerHeight();
    
    // click event
    $('.scroll').click(function(e){
        // link href of the scroll class
        var sectionHref = $(this).attr('href');
        
        // scrolling animation
        $('html, body').animate({
            scrollTop: $(sectionHref).offset().top - headerLocation // locate at pixels where the attr href is  
        }, 800);
        
        // prevent default function of event
        e.preventDefault();   
    });
});

function onScroll(e){
    var scrollPos = $(document).scrollTop();
    $('.navbar a').each(function() {
        var currLink = $(this);
        var refElement = $(currLink.attr("href"));
        if (refElement.position().top <= scrollPos && refElement.position().top + refElement.height() > scrollPos) {
            $(this).removeClass("active");
            currLink.addClass("active");
        }
        else{
            currLink.removeClass("active");
        }
    });
}

$(window).scroll(function() {
    if ($(".navbar").offset().top > 100) {
        $(".fixed-top").addClass("bg-nav-collapse p-2 p-2-ease");
        $(".nav-divider").addClass("divider-inverted");
        $(".navbar-nav a").attr("style", "color: black !important");
        $(".spotme img").attr('src', "misc/images/logo/spotme-inverted.png");
    } else {
        $(".fixed-top").removeClass("bg-nav-collapse p-2 p-2-ease");
        $(".nav-divider").removeClass("divider-inverted");
        $(".navbar-nav a").attr("style", "color: white !important");
        $(".spotme img").attr('src', "misc/images/logo/spotme.png");
    }
});