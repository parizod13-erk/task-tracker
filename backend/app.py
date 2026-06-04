import os
import bcrypt
from flask import Flask ,request ,jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager ,create_access_token ,jwt_required
from dotenv import load_dotenv
from models import db ,User ,Task

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*", "allow_headers": ["Authorization", "Content-Type"], "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]}})


app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL" ,"sqlite:///database.db")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv("JWT_SECRET_KEY" ,'super-secret-key-that-is-very-long-and-secure-12345')

db.init_app(app)
jwt = JWTManager(app)

with app.app_context():
    db.create_all()


@app.route('/' ,methods=['GET'])
def home():
    return jsonify({"message": "Бэкенд таск-трекера успешно работает!"}) ,200


@app.route('/api/register' ,methods=['POST'])
def register():
    data = request.get_json()
    if not data or 'username' not in data or 'email' not in data or 'password' not in data:
        return jsonify({"error": "Заполните все поля"}) ,400

    if User.query.filter_by(username=data['username']).first() or User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Пользователь уже существует"}) ,400

    hashed = bcrypt.hashpw(data['password'].encode('utf-8') ,bcrypt.gensalt()).decode('utf-8')
    new_user = User(username=data['username'] ,email=data['email'] ,password_hash=hashed ,role=data.get('role' ,'user'))

    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "Успешная регистрация"}) ,201


@app.route('/api/login' ,methods=['POST'])
def login():
    data = request.get_json()
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({"error": "Введите логин и пароль"}) ,400

    user = User.query.filter_by(username=data['username']).first()
    if user and bcrypt.checkpw(data['password'].encode('utf-8') ,user.password_hash.encode('utf-8')):
        # ИСПРАВЛЕНИЕ: Передаем ID пользователя как строку
        access_token = create_access_token(identity=str(user.id))
        return jsonify(
            {"token": access_token ,"user": {"id": user.id ,"username": user.username ,"role": user.role}}) ,200

    return jsonify({"error": "Неверный логин или пароль"}) ,401


@app.route('/api/tasks' ,methods=['GET'])
@jwt_required()
def get_tasks():
    tasks = Task.query.all()
    output = []
    for task in tasks:
        assigned_to = task.assigned_user.username if task.assigned_user else None
        output.append({
            "id": task.id ,"title": task.title ,"description": task.description ,
            "status": task.status ,"user_id": task.user_id ,"assigned_to": assigned_to
        })
    return jsonify(output) ,200


@app.route('/api/tasks' ,methods=['POST'])
@jwt_required()
def create_task():
    data = request.get_json()
    if not data or 'title' not in data:
        return jsonify({"error": "Название задачи обязательно"}) ,400
    new_task = Task(title=data['title'] ,description=data.get('description' ,'') ,status=data.get('status' ,'To Do') ,
                    user_id=data.get('user_id'))
    db.session.add(new_task)
    db.session.commit()
    return jsonify({"message": "Задача создана" ,"id": new_task.id}) ,201


@app.route('/api/tasks/<int:task_id>' ,methods=['PUT'])
@jwt_required()
def update_task(task_id):
    task = Task.query.get_or_404(task_id)
    data = request.get_json()
    if 'title' in data: task.title = data['title']
    if 'description' in data: task.description = data['description']
    if 'status' in data and data['status'] in ['To Do' ,'In Progress' ,'Done']: task.status = data['status']
    if 'user_id' in data: task.user_id = data['user_id']
    db.session.commit()
    return jsonify({"message": "Задача actualizada"}) ,200


@app.route('/api/tasks/<int:task_id>' ,methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    task = Task.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    return jsonify({"message": "Задача удалена"}) ,200


@app.route('/api/users' ,methods=['GET'])
@jwt_required()
def get_users():
    users = User.query.all()
    return jsonify([{"id": u.id ,"username": u.username} for u in users]) ,200


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
