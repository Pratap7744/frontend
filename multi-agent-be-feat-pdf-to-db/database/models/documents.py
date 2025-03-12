from database import db
import uuid
from sqlalchemy.dialects.postgresql import UUID

class Document(db.Model):
    __tablename__ = 'document'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category = db.Column(db.String(255))
    company_to = db.Column(db.String(255))
    company_from = db.Column(db.String(255))
    file_name = db.Column(db.String(255))
    file_text = db.Column(db.Text)
    is_elastic_migrated = db.Column(db.Boolean, default=False)
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'category': self.category,
            'company_to': self.company_to,
            'company_from': self.company_from,
            'file_name': self.file_name,
            'file_text': self.file_text,
            'is_elastic_migrated': self.is_elastic_migrated
        }