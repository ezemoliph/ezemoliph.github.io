/*
	Ajustes de ezemoli sobre la plantilla Multiverse.
	Va despues de main.js: toca el visor (poptrox) ya armado.

	1. Deja lugar debajo de la foto para el nombre y el epigrafe.
	2. En el celular se pasa de foto deslizando el dedo (la plantilla ni siquiera
	   mostraba las flechas).
	3. Deslizar hacia abajo cierra la foto.
	4. El gesto o el boton "atras" del telefono cierra la foto en vez de salirse
	   de la pagina: al abrirla se apila un estado de historial.
	5. En una pagina de categoria, deslizar hacia la derecha vuelve a la portada.
*/

(function ($) {

	var $body = $('body'),
		main = document.getElementById('main');

	if (!main || !main._poptrox)
		return;

	var opciones = main._poptrox,
		$visor = $('.poptrox-popup'),
		visor = $visor[0];

	// Sin esto, una foto sin epigrafe (Trabajos) muestra "(untitled)".
		opciones.popupBlankCaptionText = '';

	// Alto que se le resta a la ventana para que el epigrafe entre debajo de la
	// foto sin que nada se salga de la pantalla. En el celular el epigrafe cae
	// en mas lineas, asi que se reserva mas. Se fija antes de cada foto: poptrox
	// recalcula el tamano recien cuando la imagen termina de cargar.
		function reservar() {
			opciones.windowHeightPad = ($(window).width() <= 736) ? -150 : -115;
		}

		reservar();

	// Al pasar de foto, borrar el epigrafe viejo mientras carga la nueva.
		$visor.on('poptrox_switch', function () {
			reservar();
			$visor.find('.caption').empty();
		});

	// ---- El "atras" del telefono cierra la foto ----------------------------

		var apilado = false,
			cerrandoPorHistorial = false;

		$visor.on('poptrox_open', function () {
			if (!apilado && window.history.pushState) {
				window.history.pushState({ visor: 1 }, '');
				apilado = true;
			}
		});

		$visor.on('poptrox_close', function () {
			if (apilado && !cerrandoPorHistorial)
				window.history.back();

			apilado = false;
		});

		$(window).on('popstate', function () {
			if (!$body.hasClass('modal-active'))
				return;

			cerrandoPorHistorial = true;
			apilado = false;
			$visor.trigger('poptrox_close');
			cerrandoPorHistorial = false;
		});

	// ---- Deslizar dentro del visor -----------------------------------------

		if (visor) {

			var vx = null, vy = null, vt = 0, hubo_gesto = false;

			visor.addEventListener('touchstart', function (ev) {

				// Dos dedos es zoom, no gesto.
					if (ev.touches.length !== 1) {
						vx = null;
						return;
					}

				vx = ev.touches[0].clientX;
				vy = ev.touches[0].clientY;
				vt = Date.now();
				hubo_gesto = false;

			}, { passive: true });

			visor.addEventListener('touchend', function (ev) {

				if (vx === null)
					return;

				var t = ev.changedTouches[0],
					dx = t.clientX - vx,
					dy = t.clientY - vy,
					lento = (Date.now() - vt) > 900;

				vx = null;

				if (lento)
					return;

				// Al costado: foto anterior o siguiente.
					if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) {
						hubo_gesto = true;
						$visor.trigger(dx < 0 ? 'poptrox_next' : 'poptrox_previous');
					}

				// Hacia abajo: cerrar.
					else if (dy > 70 && dy > Math.abs(dx) * 1.4) {
						hubo_gesto = true;
						$visor.trigger('poptrox_close');
					}

			}, { passive: true });

			// El toque que termina un gesto tambien dispara el click que cierra
			// el visor. Ese click se come aca.
				visor.addEventListener('click', function (ev) {

					if (!hubo_gesto)
						return;

					hubo_gesto = false;
					ev.preventDefault();
					ev.stopPropagation();

				}, true);

		}

	// ---- Deslizar para volver a la portada ---------------------------------

		if (document.querySelector('#main .banda .volver')) {

			var px = null, py = null, pt = 0, volviendo = false;

			document.addEventListener('touchstart', function (ev) {

				if (ev.touches.length !== 1 || $body.hasClass('modal-active')) {
					px = null;
					return;
				}

				// El borde izquierdo es del navegador, que ahi tiene su propio
				// gesto de atras. Si lo tomamos nosotros, vuelve dos paginas.
					if (ev.touches[0].clientX < 30) {
						px = null;
						return;
					}

				px = ev.touches[0].clientX;
				py = ev.touches[0].clientY;
				pt = Date.now();

			}, { passive: true });

			document.addEventListener('touchend', function (ev) {

				if (px === null)
					return;

				var t = ev.changedTouches[0],
					dx = t.clientX - px,
					dy = t.clientY - py,
					lento = (Date.now() - pt) > 700;

				px = null;

				if (lento || dx < 90 || Math.abs(dy) > 50)
					return;

				volviendo = true;

				var mismo_sitio = document.referrer
					&& document.referrer.indexOf(window.location.origin) === 0;

				if (mismo_sitio && window.history.length > 1)
					window.history.back();
				else
					window.location.href = 'index.html';

			}, { passive: true });

			// Que el gesto sobre una foto no la abra de paso.
				document.addEventListener('click', function (ev) {

					if (!volviendo)
						return;

					volviendo = false;
					ev.preventDefault();
					ev.stopPropagation();

				}, true);

		}

})(jQuery);
