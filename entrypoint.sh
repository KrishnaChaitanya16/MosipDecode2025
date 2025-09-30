#!/bin/bash
set -e

echo "Checking Ollama status..."

# Install Ollama if missing
if ! command -v ollama &> /dev/null; then
    echo "Installing Ollama..."
    curl -sSf https://ollama.com/install.sh | sh
    export PATH="$HOME/.ollama/bin:$PATH"
fi

# Start Ollama daemon if not running
if ! pgrep -x "ollama" > /dev/null; then
    echo "Starting Ollama daemon..."
    ollama start &
    sleep 5
fi

# Pull model if missing
if ! ollama list models | grep -q "qwen2.5:1.5b"; then
    echo "Pulling qwen2.5:1.5b..."
    ollama pull qwen2.5:1.5b
fi

echo "Ollama is ready with qwen2.5:1.5b."

# Start mappingfinal.py in background (detached)
echo "Starting mappingfinal.py..."
nohup python3 app/mappingfinal.py > /app/mapping.log 2>&1 &

# Wait for mappingfinal.py to be healthy
echo "Waiting for mappingfinal.py initialization..."
until curl -s http://127.0.0.1:8001/health | grep -q "ok"; do
    sleep 2
done

echo "mappingfinal.py is ready!"

# Start second FastAPI server (foreground, container main process)
echo "Starting FastAPI app.main:app on port 8000..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
