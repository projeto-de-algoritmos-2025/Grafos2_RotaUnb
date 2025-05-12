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

    function calculateFullPath(points) {
        let fullPath = [];
        let totalDistance = 0;
        let segments = [];

        const promises = [];

        for (let i = 0; i < points.length - 1; i++) {
            const start = points[i];
            const end = points[i + 1];

            promises.push(
                fetch('/api/calculate-path', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        start: start,
                        end: end
                    })
                })
                    .then(response => {
                        if (!response.ok) throw new Error('Erro na requisição');
                        return response.json();
                    })
            );
        }

        Promise.all(promises)
            .then(results => {
                results.forEach((result, i) => {
                    if (result.error) throw new Error(result.error);

                    const segmentPath = i === results.length - 1 ?
                        result.path :
                        result.path.slice(0, -1);

                    fullPath = [...fullPath, ...segmentPath];
                    totalDistance += result.distance;

                    segments.push({
                        from: points[i],
                        to: points[i + 1],
                        distance: result.distance,
                        path: result.path_details
                    });
                });

                displayResults(fullPath, totalDistance, segments);
            })
            .catch(error => {
                console.error('Error:', error);
                pathResult.innerHTML = `<p class="error">Erro ao calcular rota: ${error.message}</p>`;
            })
            .finally(() => {
                loadingIndicator.style.display = 'none';
            });
    }

    function displayResults(path, distance, segments) {
        pathResult.innerHTML = '<h3>Caminho Completo:</h3>';

        path.forEach((pointIdx, i) => {
            const location = locations.find(loc => loc.índice === pointIdx);
            if (!location) return;

            const step = document.createElement('div');
            step.className = 'path-step';

            if (i === 0) {
                step.classList.add('start');
                step.textContent = `🏁 Partida: (${location.índice}) - ${location.sigla} - ${location.nome}`;
            } else if (i === path.length - 1) {
                step.classList.add('end');
                step.textContent = `🏁 Chegada: (${location.índice}) - ${location.sigla} - ${location.nome}`;
            } else {
                step.textContent = `→ (${location.índice}) - ${location.sigla} - ${location.nome}`;
            }

            pathResult.appendChild(step);
        });

        distanceResult.innerHTML = `Distância Total: <strong>${distance.toFixed(2)} km</strong>`;

        pathDetails.innerHTML = '<h3>Detalhes do Percurso:</h3>';

        segments.forEach((segment, idx) => {
            const fromLoc = locations.find(loc => loc.índice === segment.from);
            const toLoc = locations.find(loc => loc.índice === segment.to);

            const segmentDiv = document.createElement('div');
            segmentDiv.className = 'path-details-segment';
            segmentDiv.innerHTML = `
                <h4>Segmento ${idx + 1}: (${fromLoc.índice}) - ${fromLoc.sigla} → (${toLoc.índice}) - ${toLoc.sigla}</h4>
                <p>Distância: ${segment.distance.toFixed(2)} km</p>
                <div class="segment-path"></div>
                <hr>
            `;

            const segmentPathDiv = segmentDiv.querySelector('.segment-path');
            segment.path.forEach((point, i) => {
                const pointDiv = document.createElement('div');
                pointDiv.className = 'path-point';

                if (i === 0) {
                    pointDiv.textContent = `🏁 (${point.index}) - ${point.sigla} - ${point.name}`;
                } else if (i === segment.path.length - 1) {
                    pointDiv.textContent = `🏁 (${point.index}) - ${point.sigla} - ${point.name}`;
                } else {
                    pointDiv.textContent = `→ (${point.index}) - ${point.sigla} - ${point.name}`;
                }

                segmentPathDiv.appendChild(pointDiv);
            });

            pathDetails.appendChild(segmentDiv);
        });
    }

    function resetForm() {
        startSelect.value = '';
        endSelect.value = '';
        intermediateSelect.selectedIndex = -1;
        pathResult.innerHTML = '<p>Selecione os pontos e clique em "Calcular Rota"</p>';
        distanceResult.innerHTML = '';
        pathDetails.innerHTML = '';
    }
});