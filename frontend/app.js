const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : 'http://<BACKEND-EXTERNAL-IP>:8000';

const TEAM_COLORS = {
    'UI': '#f59e0b',
    'Platform': '#8b5cf6',
    'Identity': '#3b82f6',
    'Catalog': '#10b981',
    'Commerce': '#ef4444',
    'Data': '#06b6d4',
    'Operations': '#f97316'
};

const DEFAULT_COLOR = '#6b7280';
let cy = null;

const EXAMPLE_NOTES = `Our e-commerce platform architecture:
Frontend: React SPA (owned by UI team) that communicates with an API Gateway.
API Gateway (Platform team) handles routing and rate limiting. It forwards requests to:
- User Service (Identity team): Manages authentication, user profiles, and sessions. Stores data in Users PostgreSQL database.
- Product Service (Catalog team): Handles product catalog, search, and inventory. Uses Elasticsearch for search and PostgreSQL for inventory data.
- Order Service (Commerce team): Processes orders, payments, and order history. Writes to Orders PostgreSQL database.
- Notification Service (Communications team): Sends emails and SMS. Reads from RabbitMQ queue and uses SendGrid API.
Background Jobs:
- Order Processing Worker (Commerce team): Reads from RabbitMQ, processes payments, updates inventory.
- Analytics Worker (Data team): Consumes events from Kafka and writes to Data Warehouse.
All services publish events to Kafka (managed by Platform team).`;

function initGraph() {
    cy = cytoscape({
        container: document.getElementById('graph'),
        elements: [],
        style: [
            {
                selector: 'node',
                style: {
                    'background-color': 'data(color)',
                    'label': 'data(label)',
                    'width': 60,
                    'height': 60,
                    'text-valign': 'bottom',
                    'text-halign': 'center',
                    'text-margin-y': 5,
                    'font-size': '12px',
                    'text-wrap': 'wrap',
                    'text-max-width': '100px',
                    'border-width': 2,
                    'border-color': '#ffffff',
                    'overlay-opacity': 0
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 2,
                    'line-color': '#cbd5e1',
                    'target-arrow-color': '#cbd5e1',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier',
                    'arrow-scale': 1.5,
                    'label': 'data(relationship)',
                    'font-size': '10px',
                    'text-rotation': 'autorotate',
                    'text-margin-y': -10,
                    'color': '#64748b'
                }
            }
        ],
        layout: {
            name: 'breadthfirst',
            directed: true,
            padding: 50,
            spacingFactor: 1.5
        },
        minZoom: 0.3,
        maxZoom: 3,
        wheelSensitivity: 0.2
    });

    cy.on('tap', 'node', function(event) {
        const node = event.target;
        showNodeDetails(node.data());
    });

    cy.on('tap', function(event) {
        if (event.target === cy) {
            hideNodeDetails();
        }
    });
}

function showNodeDetails(data) {
    document.getElementById('nodeName').textContent = data.label;
    document.getElementById('nodeTeam').textContent = data.team || 'Unknown';
    document.getElementById('nodeType').textContent = data.type || 'Unknown';
    document.getElementById('nodeDescription').textContent = data.description || 'No description';
    document.getElementById('nodeDetails').classList.add('active');
}

function hideNodeDetails() {
    document.getElementById('nodeDetails').classList.remove('active');
}

function showStatus(message, type) {
    const statusEl = document.getElementById('status');
    statusEl.textContent = message;
    statusEl.className = `status ${type}`;
    statusEl.style.display = 'block';
}

function hideStatus() {
    document.getElementById('status').style.display = 'none';
}

async function generateMap() {
    const notes = document.getElementById('notes').value.trim();
    if (!notes) {
        showStatus('Please enter some architecture notes', 'error');
        return;
    }
    const generateBtn = document.getElementById('generateBtn');
    generateBtn.disabled = true;
    showStatus('Analyzing architecture notes...', 'loading');
    try {
        const response = await fetch(`${API_URL}/map`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ notes: notes })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to generate map');
        }
        const systemMap = await response.json();
        renderGraph(systemMap);
        showStatus(`Generated map with ${systemMap.nodes.length} components`, 'success');
        setTimeout(hideStatus, 3000);
    } catch (error) {
        showStatus(`Error: ${error.message}`, 'error');
        console.error('Map generation error:', error);
    } finally {
        generateBtn.disabled = false;
    }
}

function renderGraph(systemMap) {
    cy.elements().remove();
    const elements = [];
    systemMap.nodes.forEach(node => {
        elements.push({
            id: node.id,
            label: node.label,
            team: node.team,
            type: node.type,
            description: node.description,
            color: TEAM_COLORS[node.team] || DEFAULT_COLOR
        });
    });
    systemMap.edges.forEach(edge => {
        elements.push({
            source: edge.source,
            target: edge.target,
            relationship: edge.relationship
        });
    });
    cy.add(elements);
    cy.layout({
        spacingFactor: 1.5,
        animate: true,
        animationDuration: 500
    });
    cy.fit(50);
}

function loadExample() {
    document.getElementById('notes').value = EXAMPLE_NOTES;
}
document.getElementById('generateBtn').addEventListener('click', generateMap);
document.getElementById('loadExample').addEventListener('click', loadExample);
document.addEventListener('DOMContentLoaded', initGraph);
