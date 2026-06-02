from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer ,primary_key=True)
    username = db.Column(db.String(80) ,unique=True ,nullable=False)
    email = db.Column(db.String(120) ,unique=True ,nullable=False)
    password_hash = db.Column(db.String(255) ,nullable=False)
    role = db.Column(db.String(20) ,default='user')

    tasks = db.relationship('Task' ,backref='assigned_user' ,lazy=True)


class Task(db.Model):
    __tablename__ = 'tasks'

    id = db.Column(db.Integer ,primary_key=True)
    title = db.Column(db.String(200) ,nullable=False)
    description = db.Column(db.Text ,nullable=True)
    status = db.Column(db.String(20) ,default='To Do')
    created_at = db.Column(db.DateTime ,default=datetime.utcnow)
    user_id = db.Column(db.Integer ,db.ForeignKey('users.id') ,nullable=True)
