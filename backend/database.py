import sqlite3
from prettytable import PrettyTable # type: ignore
from werkzeug.security import generate_password_hash, check_password_hash #type: ignore


conn = sqlite3.connect("myhabit.db")
conn.row_factory = sqlite3.Row
c = conn.cursor()
c.execute("CREATE TABLE IF NOT EXISTS Tasks (taskid INTEGER PRIMARY KEY, task_name TEXT NOT NULL, duedate DATE, userid REFERENCES User(userid));")
c.execute('CREATE TABLE IF NOT EXISTS Users (userid INTEGER PRIMARY KEY, firstname TEXT, hash TEXT, email TEXT)')
c.execute('CREATE TABLE IF NOT EXISTS Habits (habitid INTEGER PRIMARY KEY, habitname TEXT, hfrequency NOT NULL, hduration INTEGER Check (hduration > 0), userid REFERENCES User(userid))')
c.execute('CREATE TABLE IF NOT EXISTS HabitScore (habitscore INTEGER PRIMARY KEY, date DATE NOT NULL, completed NOT NULL CHECK (completed IN ("Yes","No")), habitid REFERENCES Habit(habitid), userid REFERENCES User(userid))')


allowed_tables = ['Users','Habits','Tasks','HabitScore']


def view(name):
    if not name:
        print("Usage: name")
        return
    
    ##Ensure name is allowable content to prevent SQL INJECTION
    if name in allowed_tables:
        try:
            ##GRAB DESIRED DATA
            c.execute(f"SELECT * FROM {name};")
            data = c.fetchall()

            ##INITIALIZE PRETTY TABLE
            table = PrettyTable()

            ##Grab Column Headers and set to field names
            columns = [description[0] for description in c.description]
            table.field_names = columns

            ##PLACE DATA IN TABLE
            for row in data:
                table.add_row(row)   
            print(table)

        except EOFError as e:
            print(f"Error: {e}")
        
def insert_user(name, password, email):

    try:
        hash = generate_password_hash(password)
        c.execute("INSERT INTO Users(firstname, hash, email) VALUES (?,?,?);",(name,hash,email))
        conn.commit()

    except EOFError:
        print("Error")


def insert_task():
    name = input("Task Name: ")
    date = input("Due Date: (YYYY-MM-DD)")
    userid = int(input("What user does this reference? "))
    c.execute("SELECT userid FROM Users")
    if userid not in [item[0] for item in c.fetchall()]:
        print("Foreign key error")
        return
    if not name or not date:
        print("Incorrect info")
        return
    try:
        c.execute('INSERT INTO Tasks(task_name,duedate,userid) VALUES (?,?,?);',(name,date,userid))
        conn.commit()
    except EOFError:
        print("Error")

def insert_habit():
    hname = input("Habit: ")
    freq = input("Frequency:" )
    duration = input("Duration: (Mins) ")
    userid = int(input("What User does this reference?"))
    if not (hname and freq and duration):
        print('error')
        return
    c.execute("SELECT userid FROM Users")
    if userid not in [item[0] for item in c.fetchall()]:
        print("WRONG USERID")
        return
    try:
        c.execute("INSERT INTO Habits(habitname, hfrequency, hduration, userid) VALUES (?,?,?,?);",(hname,freq,duration,userid))
        conn.commit()
    except EOFError:
        print("error") 

if __name__ == '__main__':
    view("Users")