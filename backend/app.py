from app import application
import os

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    application.run(host="0.0.0.0", port=port) 