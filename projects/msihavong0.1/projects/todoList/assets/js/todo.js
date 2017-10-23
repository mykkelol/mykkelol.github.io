// toggle strike out when clicked
$("ul").on("click", "li", function(){
	$(this).toggleClass("selected");
});

// remove when trashcan selected
$("ul").on("click", "span", function(e){
	$(this).parent().fadeOut(500, function(){
		$(this).remove();
	});
	e.stopPropagation();
});

// add to list when user press enter
$("input[type='text']").keypress(function(o){
	if (o.which === 13){
		var holdPress = $(this).val();
		if (holdPress.length > 0){
			$(this).val("");
			$("ul").append("<li><span><i class='fa fa-trash'></i></span> " + holdPress + "</li>");
		}
		else {
			$(this).prop('required', true);
		}
	}
});

// toggle when user press +
$(".fa-plus-square").click(function(){
	$("input[type='text']").fadeToggle(500);
});