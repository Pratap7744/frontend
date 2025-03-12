from flask import Flask
from flask_migrate import upgrade
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from config import Config
from database import db
import database.models

migrate = Migrate()
jwt = JWTManager()

def create_app():
    print("Starting create_app() function")
    app = Flask(__name__)
    app.config.from_object(Config)

    app.secret_key = app.config['JWT_SECRET_KEY']
    db.init_app(app)
    print("Database initialized")
    migrate.init_app(app, db, directory='database/migrations')
    print("Migrate initialized")
    with app.app_context():
        upgrade()

    jwt.init_app(app)
    print("JWT initialized")

    from src.routes import main_bp
    app.register_blueprint(main_bp)
    print("Blueprint registered")

    print("create_app() function completed")

    return app
