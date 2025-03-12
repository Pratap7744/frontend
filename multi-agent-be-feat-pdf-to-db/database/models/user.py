from database import db
from datetime import datetime
import bcrypt
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import text as sa_text

class User(db.Model):
    __tablename__ = "user"

    id = db.Column(UUID(as_uuid=True), primary_key=True, server_default=sa_text("gen_random_uuid()"))
    name = db.Column(db.String(64), index=True, nullable=False)
    email = db.Column(db.String(120), index=True, unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<User {self.name}>'

    def set_password(self, password):
        """Hashes and sets the password for the user."""
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def check_password(self, password):
        """Checks if the provided password matches the user's hashed password."""
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))