# system-mapper

**LLM-driven system boundary and responsibility mapper**  

![Python](https://img.shields.io/badge/language-Python-blue.svg)  
![License](https://img.shields.io/badge/license-MIT-green.svg)

## Overview

The **system-mapper** project is a web application that utilizes a Large Language Model (LLM) to dynamically map system boundaries and responsibilities. Built with FastAPI and Cytoscape.js, it provides an interactive interface for visualizing system architecture.

## Tutorial Reference

This repository accompanies a tutorial article available at: [INSERT_TUTORIAL_URL_HERE]

## Prerequisites
- **Docker** (version 20.10 or later)
- **Kubernetes** (version 1.18 or later)
- **Python** (version 3.11 or later)
- **OpenAI API Key** (create an account at [OpenAI](https://openai.com))

## Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/system-mapper.git
   cd system-mapper
   ```

2. **Build the Docker images**:
   ```bash
   docker build -t system-mapper-backend ./backend
   docker build -t system-mapper-frontend ./frontend
   ```

3. **Deploy to Kubernetes**:
   ```bash
   kubectl apply -f kubernetes/
   ```

4. **Set up the environment variable for the API key**:
   ```bash
   kubectl create secret generic relaxai-secret --from-literal=api-key=YOUR_API_KEY_HERE
   ```

5. **Access the application**:
   - Get the external IP of the frontend service:
   ```bash
   kubectl get services frontend-service
   ```
   - Open your browser and navigate to `http://<FRONTEND-EXTERNAL-IP>`.

## Project Structure

```plaintext
.
├── .gitignore
├── backend
│   ├── Dockerfile
│   ├── app.py
│   └── requirements.txt
├── frontend
│   ├── Dockerfile
│   ├── index.html
│   └── app.js
└── kubernetes
    ├── backend-deployment.yaml
    ├── backend-service.yaml
    ├── frontend-deployment.yaml
    ├── frontend-service.yaml
    └── relaxai-secret.yaml
```  

## Key Concepts

- **FastAPI**: A modern web framework for building APIs with Python 3.6+ based on standard Python type hints.
- **Cytoscape.js**: A JavaScript library for visualizing complex networks and graphs.
- **Kubernetes**: An open-source system for automating the deployment, scaling, and management of containerized applications.

## Code Highlights

- **CORS Middleware in FastAPI**: The backend uses CORS middleware to allow cross-origin requests, which is essential for frontend-backend communication.
  ```python
  app.add_middleware(
      CORSMiddleware,
      allow_origins=["*"],  # For demo purposes; tighten for production
  )
  ```

- **Dynamic API URL in Frontend**: The frontend dynamically sets the API URL based on the environment, allowing for easy local and production configurations.
  ```javascript
  const API_URL = window.location.hostname === 'localhost'
      ? 'http://localhost:8000'
      : 'http://<BACKEND-EXTERNAL-IP>:8000';
  ```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.