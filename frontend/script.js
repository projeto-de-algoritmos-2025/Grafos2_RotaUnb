document.addEventListener('DOMContentLoaded', function () {
    const startSelect = document.getElementById('start-point');
    const endSelect = document.getElementById('end-point');
    const intermediateSelect = document.getElementById('intermediate-points');
    const calculateBtn = document.getElementById('calculate-btn');
    const resetBtn = document.getElementById('reset-btn');
    const pathResult = document.getElementById('path-result');
    const mapBtn = document.getElementById('map-btn');
    const modal = document.getElementById('map-modal');
    const closeModal = document.getElementById('close-modal');
    const mapImage = document.getElementById('map-image');
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const distanceResult = document.getElementById('distance-result');
    const pathDetails = document.getElementById('path-details');
    const loadingIndicator = document.getElementById('loading');

    let scale = 1;
    let locations = [];

    fetch('/api/locations')
        .then(response => {
            if (!response.ok) throw new Error('Erro ao carregar dados');
            return response.json();
        })
        .then(data => {
            locations = data;
            populateSelects();
        })
        .catch(error => {
            console.error('Error:', error);
            pathResult.innerHTML = `<p class="error">Erro ao carregar locais: ${error.message}</p>`;
        });

    function populateSelects() {
        startSelect.innerHTML = '<option value="">Selecione...</option>';
        endSelect.innerHTML = '<option value="">Selecione...</option>';
        intermediateSelect.innerHTML = '';

        locations.sort((a, b) => a.índice - b.índice);

        locations.forEach(location => {
            const optionText = `(${location.índice}) - ${location.sigla}`;

            const option1 = new Option(optionText, location.índice);
            const option2 = new Option(optionText, location.índice);
            const option3 = new Option(optionText, location.índice);

            startSelect.add(option1);
            endSelect.add(option2);
            intermediateSelect.add(option3);
        });
    }

    mapBtn.addEventListener('click', () => {
        modal.style.display = 'block';
        scale = 1;
        mapImage.style.transform = `scale(${scale})`;
    });

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    mapImage.addEventListener('wheel', function (e) {
        e.preventDefault();
        const zoomIntensity = 0.1;
        if (e.deltaY < 0) {
            scale += zoomIntensity;
        } else {
            scale = Math.max(1, scale - zoomIntensity);
        }
        mapImage.style.transform = `scale(${scale})`;
    });

    zoomInBtn.addEventListener('click', () => {
        scale += 0.1;
        mapImage.style.transform = `scale(${scale})`;
    });

    zoomOutBtn.addEventListener('click', () => {
        scale = Math.max(1, scale - 0.1);
        mapImage.style.transform = `scale(${scale})`;
    });

    calculateBtn.addEventListener('click', calculatePath);
    resetBtn.addEventListener('click', resetForm);

    function calculatePath() {
        const start = parseInt(startSelect.value);
        const end = parseInt(endSelect.value);
        const intermediates = Array.from(intermediateSelect.selectedOptions)
            .map(opt => parseInt(opt.value));

        if (!start || !end) {
            alert('Selecione pelo menos o ponto de partida e de chegada.');
            return;
        }

        if (start === end) {
            alert('Partida e chegada não podem ser iguais.');
            return;
        }

        const pointsToVisit = [start, ...intermediates, end];
        const uniquePoints = [...new Set(pointsToVisit)];

        if (uniquePoints.length < 2) {
            alert('Selecione pelo menos dois pontos distintos.');
            return;
        }

        loadingIndicator.style.display = 'block';
        pathResult.innerHTML = '';
        distanceResult.innerHTML = '';
        pathDetails.innerHTML = '';

        calculateFullPath(uniquePoints);
    }
});
