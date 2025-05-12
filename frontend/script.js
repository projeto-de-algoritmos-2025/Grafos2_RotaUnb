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

