#!/bin/bash
cd "/mnt/c/Users/23shl/Desktop/Coding/Side-Projects/CosmicDharma/backend"
source "/mnt/c/Users/23shl/Desktop/Coding/Side-Projects/CosmicDharma/backend/venv/bin/activate"
uvicorn main:app --reload --host 0.0.0.0 --port 8000
