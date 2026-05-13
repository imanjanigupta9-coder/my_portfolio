from flask import Flask, render_template, request, redirect, session, url_for, flash
import sqlite3
import os

app = Flask(__name__)
app.secret_key = "anjani_2025_secret"

# DATABASE SETUP
DATABASE = 'database.db'

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes the database and creates tables if they don't exist."""
    db = get_db()
    # Create projects table
    db.execute('''
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            stack TEXT NOT NULL,
            image_url TEXT NOT NULL,
            github_url TEXT
        )
    ''')
    # Create materials table
    db.execute('''
        CREATE TABLE IF NOT EXISTS materials (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            link TEXT NOT NULL
        )
    ''')
    db.commit()
    db.close()

# --- PUBLIC ROUTES ---
@app.route('/')
def index():
    db = get_db()
    projects = db.execute('SELECT * FROM projects').fetchall()
    materials = []
    if session.get('is_subscriber'):
        materials = db.execute('SELECT * FROM materials').fetchall()
    db.close()
    return render_template('index.html', projects=projects, materials=materials)

# --- SUBSCRIBER LOGIN ---
@app.route('/subscriber_login', methods=['POST'])
def sub_login():
    email = request.form.get('email')
    if email:
        session['is_subscriber'] = True
        session['user_email'] = email
    return redirect(url_for('index'))

# --- ADMIN PANEL ---
@app.route('/admin', methods=['GET', 'POST'])
def admin():
    if request.method == 'POST':
        password = request.form.get('password')
        if password == "Anjani@123": 
            session['is_admin'] = True
            return redirect(url_for('admin_dashboard'))
        else:
            flash("Wrong Password!")
    return render_template('admin_login.html')

@app.route('/admin/dashboard', methods=['GET', 'POST'])
def admin_dashboard():
    if not session.get('is_admin'): 
        return redirect(url_for('admin'))
    
    db = get_db()
    if request.method == 'POST':
        # Get data from form
        title = request.form['title']
        desc = request.form['desc']
        stack = request.form['stack']
        img = request.form['img']
        git = request.form['git']
        
        db.execute('INSERT INTO projects (title, description, stack, image_url, github_url) VALUES (?,?,?,?,?)',
                   (title, desc, stack, img, git))
        db.commit()
        flash("Project Added Successfully!")
    
    # Fetch projects so you can see them on the dashboard
    projects = db.execute('SELECT * FROM projects').fetchall()
    db.close()
    return render_template('admin_dashboard.html', projects=projects)

# --- NEW: DELETE PROJECT ROUTE ---
@app.route('/admin/delete/<int:id>')
def delete_project(id):
    if not session.get('is_admin'): return redirect(url_for('admin'))
    db = get_db()
    db.execute('DELETE FROM projects WHERE id = ?', (id,))
    db.commit()
    db.close()
    flash("Project Deleted!")
    return redirect(url_for('admin_dashboard'))

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

if __name__ == '__main__':
    init_db() # Run table creation on startup
    app.run(debug=True)