let scene, camera, renderer, nanoparticle;
let currentSize = 50;

function initModel() {
    const container = document.getElementById('model-container');

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    createNanoparticle('sphere', currentSize);

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}

function createNanoparticle(shape, size) {
    if (nanoparticle) {
        scene.remove(nanoparticle);
    }

    let geometry;
    const scale = size / 50;

    switch (shape) {
        case 'sphere':
            geometry = new THREE.SphereGeometry(scale, 32, 32);
            break;
        case 'rod':
            geometry = new THREE.CylinderGeometry(scale * 0.5, scale * 0.5, scale * 2, 32);
            break;
        case 'cube':
            geometry = new THREE.BoxGeometry(scale * 1.5, scale * 1.5, scale * 1.5);
            break;
        case 'tetrahedron':
            geometry = new THREE.TetrahedronGeometry(scale * 1.2);
            break;
        default:
            geometry = new THREE.SphereGeometry(scale, 32, 32);
    }

    const materialColor = getMaterialColor(document.getElementById('material').value);
    const material = new THREE.MeshPhongMaterial({ 
        color: materialColor,
        shininess: 100,
        transparent: true,
        opacity: 0.9
    });

    nanoparticle = new THREE.Mesh(geometry, material);
    scene.add(nanoparticle);
}

function getMaterialColor(material) {
    switch (material) {
        case 'gold': return 0xFFD700;
        case 'silver': return 0xC0C0C0;
        case 'quantum_dots': return 0x00FF00;
        case 'carbon': return 0x333333;
        case 'tio2': return 0xADD8E6;
        default: return 0x888888;
    }
}

function generatePropertyData(material, property, minSize = 1, maxSize = 100, points = 20) {
    const sizes = [];
    const baseValues = [];
    const experimentalValues = [];

    for (let i = 0; i < points; i++) {
        const logMin = Math.log10(minSize);
        const logMax = Math.log10(maxSize);
        const logSize = logMin + (logMax - logMin) * (i / (points - 1));
        sizes.push(Math.pow(10, logSize));
    }

    sizes.forEach(size => {
        let value = calculateBaseProperty(material, property, size);
        baseValues.push(value);

        let fluctuation = 0;
        if (document.getElementById('show-fluctuations').checked) {
            const fluctuationScale = 0.1 * (1 + 5/size);
            const noise = Math.sin(size * 0.5) * 0.5 + Math.sin(size * 0.2) * 0.3 + Math.sin(size * 1.7) * 0.2;
            fluctuation = noise * fluctuationScale * value;
        }

        experimentalValues.push(value + fluctuation);
    });

    return { sizes, baseValues, experimentalValues };
}

function calculateBaseProperty(material, property, size) {
    let value;
    switch (property) {
        case 'band_gap':
            value = getBaseBandGap(material) + (2 / Math.pow(size, 1.37));
            break;
        case 'melting_point':
            value = getBaseMeltingPoint(material) * (1 - (10 / size));
            break;
        case 'surface_area':
            value = 6000 / size;
            break;
        case 'absorption':
            value = getBaseAbsorption(material) - (1000 / size);
            break;
        case 'conductivity':
            value = getBaseConductivity(material) * (1 - (5 / size));
            break;
        default:
            value = 0;
    }
    return value;
}

function getBaseBandGap(material) {
    switch (material) {
        case 'gold': return 0;
        case 'silver': return 0;
        case 'quantum_dots': return 1.74;
        case 'carbon': return 0.5;
        case 'tio2': return 3.2;
        default: return 0;
    }
}

function getBaseMeltingPoint(material) {
    switch (material) {
        case 'gold': return 1064;
        case 'silver': return 961.8;
        case 'quantum_dots': return 1268;
        case 'carbon': return 3550;
        case 'tio2': return 1843;
        default: return 0;
    }
}

function getBaseAbsorption(material) {
    switch (material) {
        case 'gold': return 520;
        case 'silver': return 400;
        case 'quantum_dots': return 620;
        case 'carbon': return 800;
        case 'tio2': return 380;
        default: return 0;
    }
}

function getBaseConductivity(material) {
    switch (material) {
        case 'gold': return 4.5e7;
        case 'silver': return 6.3e7;
        case 'quantum_dots': return 1e-6;
        case 'carbon': return 1e5;
        case 'tio2': return 1e-10;
        default: return 0;
    }
}

function updatePlot() {
    const material = document.getElementById('material').value;
    const property = document.getElementById('property').value;
    const shape = document.getElementById('shape').value;
    currentSize = parseInt(document.getElementById('size-range').value);
    const showFluctuations = document.getElementById('show-fluctuations').checked;
    const showTrendline = document.getElementById('show-trendline').checked;

    const data = generatePropertyData(material, property);

    const traces = [];

    if (showFluctuations) {
        traces.push({
            x: data.sizes,
            y: data.experimentalValues,
            mode: 'markers',
            name: 'Experimental Data',
            marker: {
                color: getMaterialColor(material),
                size: 8,
                line: {
                    color: 'rgba(0,0,0,0.5)',
                    width: 1
                }
            },
            opacity: 0.8
        });
    }

    if (showTrendline || !showFluctuations) {
        traces.push({
            x: data.sizes,
            y: data.baseValues,
            mode: 'lines',
            name: 'Theoretical Trend',
            line: {
                color: showFluctuations ? 'rgba(0,0,0,0.7)' : getMaterialColor(material),
                width: 3,
                dash: showFluctuations ? 'dash' : 'solid'
            }
        });
    }

    const currentValue = calculateBaseProperty(material, property, currentSize);
    traces.push({
        x: [currentSize],
        y: [currentValue],
        mode: 'markers',
        name: 'Selected Size',
        marker: {
            color: '#FF0000',
            size: 12,
            line: {
                color: 'rgba(0,0,0,0.5)',
                width: 2
            }
        }
    });

    const layout = {
        title: `Nanoparticle Size vs ${property.replace('_', ' ').toUpperCase()}`,
        xaxis: { title: 'Particle Size (nm)', type: 'log' },
        yaxis: { title: getPropertyUnit(property) },
        hovermode: 'closest',
        showlegend: true,
        legend: {
            orientation: 'h',
            y: 1.1
        }
    };

    Plotly.newPlot('plot-container', traces, layout);
    createNanoparticle(shape, currentSize);
    updateScienceInfo(material, property, currentSize);
}

function getPropertyUnit(property) {
    switch (property) {
        case 'band_gap': return 'Band Gap (eV)';
        case 'melting_point': return 'Melting Point (°C)';
        case 'surface_area': return 'Surface Area (m²/g)';
        case 'absorption': return 'Absorption Wavelength (nm)';
        case 'conductivity': return 'Electrical Conductivity (S/m)';
        default: return '';
    }
}

function updateScienceInfo(material, property, size) {
    let info = '';
    const materialName = document.getElementById('material').options[document.getElementById('material').selectedIndex].text;
    const propertyName = document.getElementById('property').options[document.getElementById('property').selectedIndex].text;

    info += `<h4>${materialName} - ${propertyName} at ${size} nm</h4>`;

    if (document.getElementById('show-fluctuations').checked) {
        info += `<p>The data points show realistic experimental fluctuations that might occur due to:</p>
                <ul>
                    <li>Size distribution in real nanoparticle samples</li>
                    <li>Measurement uncertainties</li>
                    <li>Surface defects and impurities</li>
                    <li>Environmental factors during characterization</li>
                </ul>`;
    }

    switch (property) {
        case 'band_gap':
            info += `<p>The band gap trend shows the quantum confinement effect, where electrons and holes are 
                    confined in all three dimensions, leading to discrete energy levels and increased band gap.</p>`;
            break;
        case 'melting_point':
            info += `<p>The melting point depression in nanoparticles is described by the Gibbs-Thomson equation, 
                    relating the melting temperature to particle size through surface energy considerations.</p>`;
            break;
        case 'surface_area':
            info += `<p>The high surface area of nanoparticles enables applications in catalysis, drug delivery, 
                    and sensing where surface interactions dominate.</p>`;
            break;
        case 'absorption':
            info += `<p>As particle size decreases, the absorption wavelength blue shifts due to the increase in 
                    energy gap, following the quantum confinement effect.</p>`;
            break;
        case 'conductivity':
            info += `<p>Smaller particles exhibit reduced conductivity due to enhanced electron scattering at surfaces 
                    and grain boundaries.</p>`;
            break;
    }

    document.getElementById('science-info').innerHTML = info;
}

// Attach events
document.getElementById('simulate-btn').addEventListener('click', updatePlot);
document.getElementById('size-range').addEventListener('input', (e) => {
    document.getElementById('size-value').textContent = e.target.value;
});

// Initialize everything
initModel();
updatePlot();
