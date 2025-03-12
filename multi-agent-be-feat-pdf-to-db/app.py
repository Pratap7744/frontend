from src import create_app
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()

app = create_app()

CORS(app)
cors = CORS(app, resource={
    r"/*":{
        "origins":"*"
    }
})

if __name__ == '__main__':
    # Use Flask's built-in server for development
    app.run(host='0.0.0.0', port=5000, debug=True)

    # import uvicorn
    # uvicorn.run("app:app", host="0.0.0.0", port=5000, log_level="info")
