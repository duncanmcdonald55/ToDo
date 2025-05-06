from flask import Flask, jsonify, request, session, redirect, g  #type: ignore
from werkzeug.security import generate_password_hash, check_password_hash #type: ignore
from flask_cors import CORS #type: ignore
import sqlite3
from database import insert_user

app = Flask(__name__)
app.secret_key = 'dev'
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = False
app.config['SESSION_USE_SIGNER'] = True
app.config['SESSION_COOKIE_SECURE'] = False
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
CORS(app, supports_credentials=True, origins=["http://localhost:5173"], expose_headers=["Content-Type", "Authorization"])


# Helper Functions

def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect("myhabit.db")
        g.db.row_factory = sqlite3.Row
    return g.db

@app.teardown_appcontext
def close_db(exception):
    db = g.pop('db',None)
    if db:
        db.close()


@app.route('/api/login', methods = ['POST'])
def login():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400
        conn = get_db()
        c = conn.cursor()
        c.execute("SELECT * FROM Users WHERE firstname = ?;",(data["firstname"],))
        user = c.fetchone()
        if not user or not check_password_hash(user["hash"], data["password"]):
            return jsonify({"error": "Invalid Credentials"}), 401
        session["userid"] = user["userid"]
        return jsonify({"Message": "Logged In"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/register', methods=["POST"])
def register():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        required_fields = ["firstname", "email", "password", "confirmation"]

        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({"error": "Missing required fields {field}"}), 400
            
        if data["password"] != data["confirmation"]:
            return jsonify({"error": "Passwords must match"}), 401
        
        conn = get_db()
        c = conn.cursor()

        c.execute("SELECT * FROM Users WHERE firstname = ?;",(data["firstname"],))
        existing_user = c.fetchone()
        if existing_user:
            return jsonify({"error": "User already exists"}), 500
        
        c.execute("SElECT * FROM Users WHERE email = ?;",(data["email"],))
        existing_email = c.fetchone()

        if existing_email:
            return jsonify({"error": "Email already exists"}), 500
        
        hash = generate_password_hash(data["password"])
        insert_user(data["firstname"], hash, data["email"])
            
        return jsonify({"Message": "User Registered"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/logout', methods = ["POST"])
def logout():
    try:
        session.clear()
        return jsonify({"Message": "Successfully Logged out"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/tasks', methods=["GET","POST"])
def get_tasks():
    try:
        userid = session.get("userid")
        if not userid:
            return jsonify({"error: User not logged in"}), 401
        conn = get_db()
        c = conn.cursor()
        
        if request.method == "POST":
            data = request.json
            if not data:
                return jsonify({"error": "User not logged in"}), 400
            if not data.get("task_name"):
                return jsonify({"error": "task name must be included"}), 400
            c.execute("INSERT INTO Tasks(task_name, duedate, userid) VALUES (?,?,?);",(data.get("task_name"), data.get("duedate", None), userid))
            conn.commit()
            c.execute("SELECT * FROM Tasks WHERE taskid = last_insert_rowid();")
            new_task = c.fetchone()
            return jsonify(dict(new_task)), 201
        

        c.execute("SELECT * FROM Tasks WHERE userid = ?;",(userid,))
        tasks = c.fetchall()
        return jsonify([dict(t) for t in tasks])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/tasks/<string:taskname>', methods = ["DELETE"])
def delete_task(taskname):
    try:
        userid = session.get("userid")
        if not userid:
            return jsonify({"error: User not logged in"}), 401
        conn = get_db()
        c = conn.cursor()
        c.execute("DELETE FROM Tasks WHERE userid = ? and task_name = ?;",(userid, taskname))
        conn.commit()
        return jsonify({"Message": "Successfully deleted"}), 204
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route("/api/habits", methods = ["GET","POST"])
def get_habit():
    try:

        userid = session.get("userid")
        if not userid:
            return jsonify({"error: User not logged in"}), 500
        conn = get_db()
        c = conn.cursor()

        if request.method == "POST":
            
            data = request.json
            if not data:
                return jsonify({"error": "No data provided"}), 401
            c.execute("INSERT INTO Habits(habitname, hfrequency, hduration, userid) VALUES (?,?,?,?);",(data.get("habitname"), data.get("hfrequency", None), data.get("hduration", None), userid))
            conn.commit()
            c.execute("SELECT * FROM Habits WHERE habitid = last_insert_rowid();")
            new_habit = c.fetchone()
            return jsonify(dict(new_habit)), 201
        
        c.execute("SELECT * FROM Habits WHERE userid = ?;",(userid,))
        habits = c.fetchall()
        return jsonify([dict(h) for h in habits])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/habits/<string:habitname>', methods=["DELETE"])
def delete_habit(habitname):
    try:
        userid = session.get("userid")
        if not userid:
            return jsonify({"error: User not logged in"}), 401
        conn = get_db()
        c = conn.cursor()

        c.execute("DELETE FROM Habits WHERE habitname = ? and userid = ?;",(habitname, userid))
        conn.commit()
        return jsonify({"Message": "Successfully Deleted"}), 204
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/session", methods=["GET"])
def check_session():
    userid = session.get("userid")
    if userid:
        return jsonify({"Message": "User logged in"})
    return jsonify({"error": "not logged in"}), 500

if __name__ == '__main__':
    app.run(debug = True)

