/* Slider de reseñas: flechas anterior / siguiente (circular) */
(function () {
    const sliders = [...document.querySelectorAll('.testimony__body')];
    const buttonNext = document.querySelector('#next');
    const buttonBefore = document.querySelector('#before');

    if (sliders.length === 0 || !buttonNext || !buttonBefore) return;

    let index = Math.max(0, sliders.findIndex(function (slide) {
        return slide.classList.contains('testimony__body--show');
    }));

    function show(newIndex) {
        sliders.forEach(function (slide, i) {
            const active = i === newIndex;
            slide.classList.toggle('testimony__body--show', active);
            slide.setAttribute('aria-hidden', active ? 'false' : 'true');
        });
        index = newIndex;
    }

    const changePosition = function (add) {
        // Con módulo, después de la última vuelve a la primera y viceversa
        show((index + add + sliders.length) % sliders.length);
    };

    buttonNext.addEventListener('click', function () { changePosition(1); });
    buttonBefore.addEventListener('click', function () { changePosition(-1); });

    show(index);
})();
