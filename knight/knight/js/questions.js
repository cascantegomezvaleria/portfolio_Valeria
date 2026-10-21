/* FAQ: acordeón que abre y cierra cada respuesta */
(function () {
    const titleQuestions = [...document.querySelectorAll('.questions__title')];

    function toggle(question) {
        let height = 0;
        const answer = question.nextElementSibling;
        const addPadding = question.parentElement.parentElement;

        addPadding.classList.toggle('questions__padding--add');
        question.children[0].classList.toggle('questions__arrow--rotate');

        if (answer.clientHeight === 0) {
            height = answer.scrollHeight;
        }

        answer.style.height = height + 'px';
        question.setAttribute('aria-expanded', height > 0 ? 'true' : 'false');
    }

    titleQuestions.forEach(function (question) {
        question.addEventListener('click', function () { toggle(question); });

        // También se puede abrir con el teclado (Enter o espacio)
        question.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggle(question);
            }
        });
    });

    // Si cambia el ancho de la pantalla, ajustar la altura de las respuestas abiertas
    window.addEventListener('resize', function () {
        titleQuestions.forEach(function (question) {
            const answer = question.nextElementSibling;
            if (question.getAttribute('aria-expanded') === 'true') {
                answer.style.height = answer.scrollHeight + 'px';
            }
        });
    });
})();
