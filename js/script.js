var menu = {
	div: $('#menu'),
	button: $('#menu-button'),
	container: $('#menu-container'),
	links: $('#links').children(),
	isExpanded: false,
	adjust: function() {
		menu.isExpanded = !menu.isExpanded;
		if (menu.isExpanded) {
			menu.div.addClass('active');
			menu.button.addClass('active');
			menu.container.addClass('active');
		} else {
			menu.div.removeClass('active');
			menu.button.removeClass('active');
			menu.container.removeClass('active');
		}
	}
}

var tagline = {
	ids: ['software', 'user-interface', 'code', 'visual-experience', 'brand'],
	index: 0,
	previousIndex: 0,
	set: function() {
		tagline.previousIndex = tagline.index;
		if (tagline.index === tagline.ids.length - 1) {
			tagline.index = 0;
		} else {
			tagline.index += 1;
		}
		$('#' + tagline.ids[tagline.previousIndex]).removeClass('active');
		$('#' + tagline.ids[tagline.index]).addClass('active');
	}
}

var form = {
	element: $('#ajax-contact'),
	alerts: $('#alerts')
}

setInterval(tagline.set, 4000);

for (var i = 0; i < menu.links.length; i += 1) {
	if (menu.links[i].nodeName.toLowerCase() === 'a') {
		menu.links[i].addEventListener('mouseup', menu.adjust);
	}
}
menu.button.mousedown(menu.adjust);

form.element.submit(function(event) {
	event.preventDefault();
	form.data = form.element.serialize();
	$.ajax({
	    type: 'POST',
	    url: $(form.element).attr('action'),
	    data: form.data
	})
		.done(function(response) {
			form.alerts.removeClass('error');
			form.alerts.addClass('success');
			form.alerts.text(response);

			$('#name').val('');
			$('#email').val('');
			$('#phone').val('');
			$('#message').val('');
		})
		.fail(function(data) {
			form.alerts.removeClass('success');
			form.alerts.addClass('error');
			if (data.responseText) {
				form.alerts.text(data.responseText)
			} else {
				form.alerts.text('An error occured and your message could not be sent.');
			}
		});
});