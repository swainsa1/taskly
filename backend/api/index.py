"""
Vercel serverless entry point.
Mangum wraps the FastAPI ASGI app for AWS Lambda / Vercel's serverless runtime.
"""
import sys
import os

# Add backend root to path so imports work
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from mangum import Mangum
from main import app

handler = Mangum(app, lifespan="on")
