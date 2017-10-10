/*global $*/

// About Hover Effect
    $("a#navAbout").hover(
        function() {
            $(".bg-nav-hover img").attr('src','image/hoverEffect/about.jpg');
            $(".new-intro").css("opacity", ".9");
        }, function() {
            $(".bg-nav-hover img").attr('src','image/hoverEffect/i_will_change_the_world.jpg');
            $(".new-intro").css("opacity", ".8");
        }
    );

// Projects Hover Effect
    $("a#navProjects").hover(
        function() {
            $(".bg-nav-hover img").attr('src','image/hoverEffect/project.jpg');
            $(".new-intro").css("opacity", ".9");
        }, function() {
            $(".bg-nav-hover img").attr('src','image/hoverEffect/i_will_change_the_world.jpg');
            $(".new-intro").css("opacity", ".8");
        }
    );

// Contact Hover Effect
    $("a#navContact").hover(
        function() {
            $(".bg-nav-hover img").attr('src','image/hoverEffect/contact.jpg');
            $(".new-intro").css("opacity", ".9");
        }, function() {
            $(".bg-nav-hover img").attr('src','image/hoverEffect/i_will_change_the_world.jpg'); 
            $(".new-intro").css("opacity", ".8");
        }
    );

// Blog Hover Effect
    $("a#navBlog").hover(
        function() {
            $(".bg-nav-hover img").attr('src','image/hoverEffect/blog.jpg');
            $(".new-intro").css("opacity", ".9");
        }, function() {
            $(".bg-nav-hover img").attr('src','image/hoverEffect/i_will_change_the_world.jpg'); 
            $(".new-intro").css("opacity", ".8");
        }
    );
    
// Testimonials Hover Effect
    $("a#navTestimonials").hover(
        function() {
            $(".bg-nav-hover img").attr('src','image/hoverEffect/testimonials.jpg');
            $(".new-intro").css("opacity", ".9");
        }, function() {
            $(".bg-nav-hover img").attr('src','image/hoverEffect/i_will_change_the_world.jpg'); 
            $(".new-intro").css("opacity", ".8");
        }
    );

