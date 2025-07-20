#!/bin/bash
cd "/mnt/c/Users/23shl/Desktop/Coding/Side-Projects/CosmicDharma/backend"
source "/mnt/c/Users/23shl/Desktop/Coding/Side-Projects/CosmicDharma/backend/venv/bin/activate"
python -m rq.cli worker profiles --url redis://localhost:6379/0
