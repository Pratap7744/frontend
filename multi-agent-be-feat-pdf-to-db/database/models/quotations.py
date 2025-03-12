from database import db
import uuid
from sqlalchemy.dialects.postgresql import UUID

class Quotation(db.Model):
    __tablename__ = 'quotation'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    group_id = db.Column(UUID(as_uuid=True))
    sequence_number = db.Column(db.Integer)
    category = db.Column(db.String(255))
    company_to = db.Column(db.String(255))
    company_from = db.Column(db.String(255))
    file_name = db.Column(db.String(255))
    file_text = db.Column(db.Text)
    content_type = db.Column(db.String(50))
    is_astra_migrated = db.Column(db.Boolean, default=False)
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'group_id': str(self.group_id),
            'sequence_number': self.sequence_number,
            'category': self.category,
            'company_to': self.company_to,
            'company_from': self.company_from,
            'file_name': self.file_name,
            'file_text': self.file_text,
            'content_type': self.content_type,
            'is_astra_migrated': self.is_astra_migrated
        } 