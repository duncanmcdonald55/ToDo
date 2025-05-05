from flask import Flask, jsonify, request, session, redirect  #type: ignore
from werkzeug.security import generate_password_hash, check_password_hash #type: ignore
from flask_cors import CORS #type: ignore
import sqlite3
from database import get_db, insert_user

app = Flask(__name__)
app.secret_key = 'Asdcso&8373ndo.>,9eu03'
CORS(app, supports_credentials=True, origins=["http://localhost:5173"], expose_headers=["Content-Type", "Authorization"])


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
        if not user or not check_password_hash(data["hash"], data["password"]):
            return jsonify({"error": "Invalid Credentials"}), 401
        session["userid"] = user["userid"]
        return jsonify({"Message": "Logged In"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "Could not register"}), 401
        if data["password"] != data["confirmation"]:
            return jsonify({"error": "Passwords must match"}), 401
        conn = get_db()
        c = conn.cursor()
        c.execute("SELECT FROM Users WHERE firstname = ?;",(data["firstname"],))
        existing = c.fetchone()
        if existing:
            return jsonify({"error": "User already exists"}), 500
        hash = generate_password_hash(data["password"])
        insert_user(data["firstname"], hash, data["email"])
        return jsonify({"Message": "User Registered"})
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
            c.execute("SELECT * FROM Habit WHERE habitid = last_inserted_rowid();")
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
        return jsonify({"error", str(e)}), 500

@app.route("/api/session", methods=["GET"])
def check_session():
    userid = session.get("userid")
    if userid:
        return jsonify({"Message": "User logged in"})
    return jsonify({"error": "not logged in"}), 500

if __name__ == '__main__':
    app.run(debug = True)

