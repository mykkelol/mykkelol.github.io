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
        }, 600);
        
        // prevent default function of event
        e.preventDefault();   
    });
});

function onScroll(e){
    var scrollPos = $(document).scrollTop();
    $('.navbar-nav a').each(function() {
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
        $(".fixed-top").addClass("bg-nav-collapse pt-0 pb-0 p-2-ease");
        $(".nav-name, .nav-subname").attr("style", "color: #2A243B !important");
        $(".navbar-nav a").attr("style", "color: #2A243B !important");
    } else {
        $(".fixed-top").removeClass("bg-nav-collapse pt-0 pb-0 p-2-ease");
        $(".nav-name, .nav-subname").attr("style", "color: #B6C8C6 !important");
        $(".navbar-nav a").attr("style", "color: #B6C8C6 !important");
    }
});