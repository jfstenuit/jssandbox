#!/bin/bash

# Ensure Docker is installed
if ! command -v docker &> /dev/null
then
    echo "[ERROR] Docker is not installed. Please install Docker and try again."
    exit 1
fi

# Ensure the malicious JavaScript file is provided as an argument
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <malicious_script.js>"
    exit 1
fi

MALICIOUS_SCRIPT=$1

# Ensure the file exists
if [ ! -f "$MALICIOUS_SCRIPT" ]; then
    echo "[ERROR] File '$MALICIOUS_SCRIPT' not found!"
    exit 1
fi

# Create a temporary directory for sandboxing
SANDBOX_DIR=$(mktemp -d)
cp "$MALICIOUS_SCRIPT" "$SANDBOX_DIR/malware.js"

# Create the Node.js sandbox script inside the temporary directory
cat sandbox.js > "$SANDBOX_DIR/sandbox.js"

# Run the analysis in Docker
echo "[INFO] Running analysis in Docker sandbox..."
docker run --rm -v "$SANDBOX_DIR:/sandbox" -w /sandbox node node sandbox.js

# Cleanup
rm -rf "$SANDBOX_DIR"

echo "[INFO] Analysis complete. Temporary sandbox removed."

