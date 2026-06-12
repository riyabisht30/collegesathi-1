"""
Quick start script for CollegeSathi backend.
Creates DB, seeds data, and starts the server.
Usage: python run.py
"""
import subprocess
import sys
import os

os.chdir(os.path.dirname(os.path.abspath(__file__)))


def main():
    print("🚀 Starting CollegeSathi Backend...\n")
    
    # Seed database
    print("📦 Seeding database with college data...")
    try:
        from app.seed_data import seed_database
        seed_database()
    except Exception as e:
        print(f"   Note: {e}")
        print("   (If DB already seeded, this is fine)\n")
    
    # Start server
    print("\n🌐 Starting FastAPI server on http://localhost:8000")
    print("   API docs: http://localhost:8000/docs\n")
    subprocess.run([
        sys.executable, "-m", "uvicorn", 
        "app.main:app", "--reload", "--port", "8000"
    ])


if __name__ == "__main__":
    main()
