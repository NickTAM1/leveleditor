// Main app code -> runs when page loads
$(function() {
	// counter for unique element IDs
	let elementCounter = 0;

	// references to DOM elements
	const $editor = $('#editor');
	const $levelId = $('#level-id');

	// createElement - creates a game element on the canvas
	// data object can have: id, type, x, y, width, height
	function createElement(data) {
		const id = data.id || 'elem_' + (++elementCounter);
		const type = data.type || 'wood';

		const elem = $('<div></div>')
			.addClass('element')
			.addClass(type)
			.attr('id', id)
			.attr('data-type', type)
			.css({
				top: data.y || 50,
				left: data.x || 50,
				width: data.width,
				height: data.height,
			})
			.appendTo($editor)

		elem.draggable({
			containment: "#editor"
		});

		elem.on("contextmenu", function (e) {
			e.preventDefault();
			if (confirm("Delete this element?")) {
				$(this).remove();
			}
		});

		return elem;
	}

	// collectElements -> gets all elements from canvas
	// returns array of element objects for saving
	function collectElements() {
		const elements = [];
		$(".element").each(function () {
			const el = $(this);
			const pos = el.position();
			elements.push({
				id: el.attr('id'),
				type: el.attr('data-type'),
				x: pos.left,
				y: pos.top,
				width: el.width(),
				height: el.height()
			});
		});

		return elements;
	}

	// render level from data
	function renderLevel(elements) {
		$editor.empty();
		elementCounter = 0;
		elements.forEach(el => {
			createElement(el);
		})
	}

	// add buttons
	$('#add-catapult').click(function () {
		createElement({ type: 'catapult', width: 80, height: 100 });
	});

	$('#add-enemy').click(function () {
		createElement({ type: 'enemy', width: 50, height: 50 });
	});

	$('#add-ground').click(function () {
		createElement({ type: 'ground', width: 200, height: 40 });
	});

	$('#add-wood').click(function () {
		createElement({ type: 'wood', width: 80, height: 30 });
	});

	$('#add-stone').click(function () {
		createElement({ type: 'stone', width: 80, height: 40 });
	});

	$('#add-tnt').click(function () {
		createElement({ type: 'tnt', width: 50, height: 60 });
	});

	// save level
	$('#save-level').click(function () {
		const blocks = collectElements();

		if (blocks.length === 0) {
			alert('The level is empty. Add some elements first.');
			return;
		}

		const id = $levelId.val().trim();
		const payload = { blocks };

		let method, url;
		if (id) {
			method = 'PUT';
			url = '/api/v1/levels/' + encodeURIComponent(id);
		} else {
			method = 'POST';
			url = '/api/v1/levels';
		}

		$.ajax({
			url,
			method,
			contentType: 'application/json',
			data: JSON.stringify(payload),
			success: function (response) {
				alert(response.message + ' (ID = ' + response.id + ')');

				if (!id) {
					$levelId.val(response.id);
				}
			},
			error: function (xhr) {
				const msg = xhr.responseJSON?.error || xhr.responseText || 'Unknown error';
				alert('Error saving level: ' + msg);
			}
		});
	});

	// load level
	$('#load-level').click(function () {
		const id = $levelId.val().trim();

		if (!id) {
			alert('Please enter a Level ID to load.');
			return;
		}

		const url = '/api/v1/levels/' + encodeURIComponent(id);

		$.ajax({
			url,
			method: 'GET',
			contentType: 'application/json',
			success: function (response) {
				renderLevel(response.blocks || []);
				alert('Level loaded.');
			},
			error: function (xhr) {
				const msg = xhr.responseJSON?.error || xhr.responseText || 'Unknown error';
				alert('Error loading level: ' + msg);
			}
		});
	});

	// delete level
	$('#delete-level').click(function () {
		const id = $levelId.val().trim();

		if (!id) {
			alert('Please enter a Level ID to delete.');
			return;
		}

		if (!confirm('Delete level "' + id + '"?')) {
			return;
		}

		const url = '/api/v1/levels/' + encodeURIComponent(id);

		$.ajax({
			url,
			method: 'DELETE',
			success: function () {
				alert('Level deleted.');
				$levelId.val('');
				$editor.empty();
			},
			error: function (xhr) {
				const msg = xhr.responseJSON?.error || xhr.responseText || 'Unknown error';
				alert('Error deleting level: ' + msg);
			}
		});
	});

});
