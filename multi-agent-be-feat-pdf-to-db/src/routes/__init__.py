from flask import Blueprint

main_bp = Blueprint('main', __name__)

from src.routes import main_routes