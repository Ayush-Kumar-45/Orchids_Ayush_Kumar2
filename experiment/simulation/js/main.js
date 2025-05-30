let scene, camera, renderer, nanoparticle;
let currentSize = 50;
let speechSynth = window.speechSynthesis;
let currentStep = 0;
const setupSteps = ['material', 'property', 'shape', 'size-input'];

function initModel() {
    const container = document.getElementById('model-container');
    
    if (renderer) {
        container.removeChild(renderer.domElement);
    }
    
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
    
    nanoparticle = null;
    
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
    
    const colors = [
        new THREE.Color(0xff0000),
        new THREE.Color(0xff9900),
        new THREE.Color(0x33cc33),
        new THREE.Color(0x3399ff),
        new THREE.Color(0xcc33ff)
    ];
    
    if (geometry.attributes.position) {
        const count = geometry.attributes.position.count;
        const colorArray = new Float32Array(count * 3);
        
        for (let i = 0; i < count; i++) {
            const colorIndex = Math.floor(i / (count / colors.length)) % colors.length;
            colorArray[i * 3] = colors[colorIndex].r;
            colorArray[i * 3 + 1] = colors[colorIndex].g;
            colorArray[i * 3 + 2] = colors[colorIndex].b;
        }
        
        geometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
    }
    
    const material = new THREE.MeshPhongMaterial({ 
        vertexColors: true,
        shininess: 100,
        transparent: true,
        opacity: 0.9
    });
    
    nanoparticle = new THREE.Mesh(geometry, material);
    scene.add(nanoparticle);
}

function generatePropertyData(material, property, minSize = 1, maxSize = 100, points = 50) {
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
            
            const noise = (Math.sin(size * 0.5 + Math.random() * 0.1) * 0.5 +
                            Math.sin(size * 0.2 + Math.random() * 0.1) * 0.3 + 
                            Math.sin(size * 1.7 + Math.random() * 0.1) * 0.2) / 1.0;
            
            fluctuation = noise * fluctuationScale * (value * 0.1);
        }
        
        experimentalValues.push(value + fluctuation);
    });
    
    return { sizes, baseValues, experimentalValues };
}

function calculateBaseProperty(material, property, size) {
    let value;
    
    switch (property) {
        case 'band_gap':
            const bulkBandGap = getBaseBandGap(material);
            if (bulkBandGap === 0) return 0;
            value = bulkBandGap + (2.5 / Math.pow(size, 1.7)); 
            break;
        case 'melting_point':
            const bulkMeltingPoint = getBaseMeltingPoint(material);
            value = bulkMeltingPoint * (1 - (6 / size));
            break;
        case 'surface_area':
            value = (6000 / size) + (Math.random() * 5);
            break;
        case 'absorption':
            const baseAbs = getBaseAbsorption(material);
            if (material === 'quantum_dots') {
                value = baseAbs - (1500 / Math.pow(size, 2));
            } else if (material === 'gold' || material === 'silver') {
                value = baseAbs - (100 / size);
            } else {
                value = baseAbs;
            }
            break;
        case 'conductivity':
            const bulkConductivity = getBaseConductivity(material);
            value = bulkConductivity * (1 - (0.5 / size));
            if (material === 'carbon' && size < 50) {
                value *= (1 + (0.01 * (50-size)));
            }
            break;
        default:
            value = 0;
    }
    
    return Math.max(0, value);
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
    currentSize = parseInt(document.getElementById('size-input').value);
    const showFluctuations = document.getElementById('show-fluctuations').checked;
    const showTrendline = document.getElementById('show-trendline').checked;
    
    if (!material || !property || !shape || isNaN(currentSize)) {
        speak("Please complete all setup steps and ensure size is a valid number before running simulation.");
        return;
    }
    
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
        title: `<b>${document.getElementById('material').options[document.getElementById('material').selectedIndex].text} - ${property.replace('_', ' ').toUpperCase()} vs Size</b>`,
        xaxis: { 
            title: 'Particle Size (nm)', 
            type: 'log',
            tickmode: 'array',
            tickvals: [1, 2, 5, 10, 20, 50, 100],
            ticktext: ['1', '2', '5', '10', '20', '50', '100'],
            gridcolor: '#e0e0e0'
        },
        yaxis: { 
            title: getPropertyUnit(property),
            gridcolor: '#e0e0e0'
        },
        hovermode: 'closest',
        showlegend: true,
        legend: {
            orientation: 'h',
            y: 1.1,
            x: 0,
            bgcolor: 'rgba(255,255,255,0.7)',
            bordercolor: '#ccc',
            borderwidth: 1
        },
        margin: { t: 80, b: 60, l: 60, r: 60 },
        plot_bgcolor: '#fcfcfc',
        paper_bgcolor: '#ffffff'
    };
    
    const plotDiv = document.getElementById('plot-container');
    plotDiv.innerHTML = '';
    
    Plotly.newPlot(plotDiv, traces, layout);
    
    createNanoparticle(shape, currentSize);
    
    updateScienceInfo(material, property, currentSize);
}

function getMaterialColor(material) {
    switch (material) {
        case 'gold': return '#FFD700';
        case 'silver': return '#C0C0C0';
        case 'quantum_dots': return '#00FF00';
        case 'carbon': return '#333333';
        case 'tio2': return '#ADD8E6';
        default: return '#888888';
    }
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
    const selectedShape = document.getElementById('shape').options[document.getElementById('shape').selectedIndex].text;
    
    info += `<h4>${materialName} (${selectedShape}) - ${propertyName} at ${size} nm</h4>`;
    
    if (document.getElementById('show-fluctuations').checked) {
        info += `<p>The observed spread in data points represents **experimental fluctuations**, common in nanomaterial characterization due to:</p>
                <ul>
                    <li>**Polydispersity:** Real nanoparticle samples often have a distribution of sizes, not a single exact size.</li>
                    <li>**Surface Effects:** Minor variations in surface defects, ligands, or oxidation states can subtly alter properties.</li>
                    <li>**Measurement Limitations:** Inherent uncertainties and environmental noise during experimental measurements.</li>
                    <li>**Shape Anisotropy:** Even for a selected shape, slight deviations can influence properties.</li>
                </ul>
                <p>These fluctuations highlight the complexity of reproducible nanomaterial synthesis and characterization.</p>`;
    }
    
    info += `<h5>Core Scientific Principle:</h5>`;
    
    switch (property) {
        case 'band_gap':
            info += `<p>The **quantum confinement effect** is prominently observed here. As the nanoparticle size decreases, the allowed energy levels for electrons and holes become quantized and spread further apart, increasing the effective band gap. This can be approximated by:</p>
                         <p>$$E_g(D) = E_g(bulk) + \\frac{h^2}{8D^2} \\left(\\frac{1}{m_e^*} + \\frac{1}{m_h^*}\\right) - \\frac{1.8e^2}{\\epsilon D}$$</p>
                         <p>where $D$ is particle diameter, $h$ is Planck's constant, $m^*$ are effective masses, $\\epsilon$ is dielectric constant. This effect is crucial for quantum dots, determining their tunable emission colors.</p>`;
            break;
        case 'melting_point':
            info += `<p>The **melting point depression** of nanoparticles is largely governed by the increased surface-to-volume ratio. Surface atoms are less coordinated and have lower binding energies, requiring less thermal energy to overcome interatomic forces. The **Gibbs-Thomson equation** or **Tolman equation** are often used:</p>
                         <p>$$T_m(D) = T_m(bulk) \\left(1 - \\frac{2 \\gamma_{sl}}{\\rho_s L_f D}\\right)$$</p>
                         <p>where $T_m$ is melting temperature, $\\gamma_{sl}$ is solid-liquid interfacial energy, $\\rho_s$ is solid density, $L_f$ is latent heat of fusion, and $D$ is diameter. This makes nanoscale materials melt at much lower temperatures than their bulk counterparts.</p>`;
            break;
        case 'surface_area':
            info += `<p>The **specific surface area** (surface area per unit mass) of nanoparticles inversely correlates with their size. As size decreases, the number of atoms on the surface relative to the bulk increases dramatically. For a spherical particle, the ratio of surface area ($A$) to volume ($V$) is $A/V = 6/D$.</p>
                         <p>This immense surface area-to-volume ratio is the driving force behind many nanomaterial applications, including:</p>
                         <ul>
                             <li><strong>Catalysis:</strong> More active sites available for chemical reactions.</li>
                             <li><strong>Adsorption:</strong> High capacity for binding molecules (e.g., in water purification).</li>
                             <li><strong>Drug Delivery:</strong> Enhanced interaction with biological systems for targeted therapy.</li>
                             <li><strong>Sensing:</strong> Increased sensitivity due to more analyte interaction.</li>
                         </ul>`;
            break;
        case 'absorption':
            info += `<p>The **optical absorption properties** of nanoparticles are highly size-dependent. For metal nanoparticles (like gold and silver), this is primarily due to **Localized Surface Plasmon Resonance (LSPR)**. The collective oscillation of conduction electrons on the nanoparticle surface absorbs specific wavelengths of light, shifting based on size, shape, and surrounding medium.</p>
                         <p>For semiconductor nanoparticles (like quantum dots), the absorption spectrum is dictated by the **quantum confinement effect**, leading to a blue shift (absorption at shorter wavelengths/higher energies) as size decreases due to the widening band gap.</p>`;
            break;
        case 'conductivity':
            info += `<p>The **electrical conductivity** of nanoparticles can exhibit complex size dependency. For metallic nanoparticles, conductivity generally decreases with decreasing size due to increased **electron scattering** at the particle surfaces and grain boundaries, which shortens the electron mean free path.</p>
                         <p>For semiconductor nanoparticles, conductivity is strongly influenced by the quantum confinement effect, which alters the band structure and thus the availability of charge carriers. Additionally, inter-particle contacts and capping ligands play a significant role in macroscopic conductivity of nanoparticle assemblies.</p>`;
            break;
    }
    
    document.getElementById('science-info').innerHTML = info;
    if (typeof MathJax !== 'undefined') {
        MathJax.typesetPromise();
    }
}

function speak(text) {
    if (speechSynth.speaking) {
        speechSynth.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    speechSynth.speak(utterance);
    
    document.getElementById('status').textContent = text;
}

function startSetup() {
    currentStep = 0;
    setupSteps.forEach(id => document.getElementById(id).disabled = true);
    document.getElementById('show-fluctuations').disabled = true;
    document.getElementById('show-trendline').disabled = true;
    document.getElementById('simulate-btn').disabled = true;

    document.getElementById('material').disabled = false;
    speak("Please select the nanomaterial type.");
}

function readSettings() {
    const material = document.getElementById('material').value;
    const property = document.getElementById('property').value;
    const shape = document.getElementById('shape').value;
    const size = document.getElementById('size-input').value;
    
    if (!material) {
        speak("No material selected yet. Please start the setup process first.");
        return;
    }
    
    let message = "Current settings: ";
    message += `Material: ${document.getElementById('material').options[document.getElementById('material').selectedIndex].text}. `;
    
    if (property) {
        message += `Property: ${document.getElementById('property').options[document.getElementById('property').selectedIndex].text}. `;
    }
    
    if (shape) {
        message += `Shape: ${document.getElementById('shape').options[document.getElementById('shape').selectedIndex].text}. `;
    }
    
    if (size && !document.getElementById('size-input').disabled) {
        message += `Size: ${size} nanometers. `;
    }
    
    if (!document.getElementById('show-fluctuations').disabled) {
           message += `Experimental fluctuations are ${document.getElementById('show-fluctuations').checked ? 'enabled' : 'disabled'}. `;
    }
    if (!document.getElementById('show-trendline').disabled) {
        message += `Theoretical trendline is ${document.getElementById('show-trendline').checked ? 'enabled' : 'disabled'}.`;
    }
    
    speak(message);
}

function handleSelection(selectId) {
    const select = document.getElementById(selectId);
    const selectedOptionText = select.options[select.selectedIndex].text;
    
    speak(`You have selected ${selectedOptionText}.`);
    
    select.disabled = true; 

    const nextStepIndex = setupSteps.indexOf(selectId) + 1;
    
    if (nextStepIndex < setupSteps.length) {
        const nextStepElementId = setupSteps[nextStepIndex];
        document.getElementById(nextStepElementId).disabled = false;
        
        if (nextStepElementId === 'property') {
            speak("Now, please select the property to plot.");
        } else if (nextStepElementId === 'shape') {
            speak("Next, select the nanoparticle shape.");
        } else if (nextStepElementId === 'size-input') {
            speak("Please enter the nanoparticle size. You can also adjust display options.");
            document.getElementById('show-fluctuations').disabled = false;
            document.getElementById('show-trendline').disabled = false;
            document.getElementById('simulate-btn').disabled = false;
        }
    } else {
        speak("Setup complete. You can now run the simulation.");
    }
}

document.getElementById('start-btn').addEventListener('click', startSetup);
document.getElementById('read-btn').addEventListener('click', readSettings);
document.getElementById('simulate-btn').addEventListener('click', updatePlot);

document.getElementById('material').addEventListener('change', function() {
    handleSelection('material');
});

document.getElementById('property').addEventListener('change', function() {
    handleSelection('property');
});

document.getElementById('shape').addEventListener('change', function() {
    handleSelection('shape');
});

document.getElementById('size-input').addEventListener('change', function() {
    const size = parseInt(this.value);
    if (isNaN(size) || size < 1) this.value = 1;
    if (size > 100) this.value = 100;
    speak(`Size set to ${this.value} nanometers.`);
});

document.getElementById('show-fluctuations').addEventListener('change', function() {
    speak(`Experimental fluctuations ${this.checked ? 'enabled' : 'disabled'}.`);
});

document.getElementById('show-trendline').addEventListener('change', function() {
    speak(`Theoretical trendline ${this.checked ? 'enabled' : 'disabled'}.`);
});

window.onload = function() {
    initModel();
    document.getElementById('science-info').innerHTML = 
        `<p>Click "Start Simulation Setup" to begin configuring your nanomaterial simulation. The voice assistant will guide you through each step.</p>`;
};