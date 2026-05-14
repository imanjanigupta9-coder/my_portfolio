from flask import Flask, render_template, request, redirect, session, url_for, flash
import sqlite3
import os
from werkzeug.utils import secure_filename
from werkzeug.exceptions import RequestEntityTooLarge
from PIL import Image
import io

app = Flask(__name__)
app.secret_key = "anjani_2025_secret"

# DATABASE SETUP
DATABASE = 'database.db'
UPLOAD_FOLDER = 'static/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_FILE_SIZE = 2 * 1024 * 1024  # 2MB per file
MAX_REQUEST_SIZE = 20 * 1024 * 1024  # 20MB total per request
FIXED_WIDTH = 800
FIXED_HEIGHT = 600

# Create upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_REQUEST_SIZE

@app.errorhandler(RequestEntityTooLarge)
def handle_large_request(error):
    flash("Upload too large. Please keep the total selected image size under 20MB and each image under 2MB.")
    return redirect(request.referrer or url_for('admin_dashboard'))

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def validate_image(file, expected_size=None):
    """Validate image file size and optional dimensions."""
    try:
        current_pos = file.stream.tell()
    except Exception:
        current_pos = None

    try:
        file.stream.seek(0, os.SEEK_END)
        size = file.stream.tell()
        file.stream.seek(0)
    except Exception:
        size = file.content_length or 0

    if size > MAX_FILE_SIZE:
        if current_pos is not None:
            file.stream.seek(current_pos)
        return False, f"File size exceeds {MAX_FILE_SIZE / 1024 / 1024:.1f}MB"
    
    try:
        img = Image.open(file.stream)
        if expected_size is not None:
            width, height = img.size
            if width != expected_size[0] or height != expected_size[1]:
                if current_pos is not None:
                    file.stream.seek(current_pos)
                return False, f"Image must be {expected_size[0]}x{expected_size[1]}px (current: {width}x{height}px)"
        if current_pos is not None:
            file.stream.seek(current_pos)
        return True, "Valid"
    except Exception as e:
        if current_pos is not None:
            file.stream.seek(current_pos)
        return False, f"Invalid image file: {str(e)}"


def save_uploaded_image(file, resize_to=None):
    """Save uploaded image and return filename, resizing when requested."""
    if not allowed_file(file.filename):
        return None, "Invalid file type. Allowed: PNG, JPG, JPEG, GIF, WebP"

    try:
        file.stream.seek(0)
    except Exception:
        pass

    filename = secure_filename(file.filename)
    timestamp = int(__import__('time').time())
    filename = f"{timestamp}_{filename}"
    filepath = os.path.join(UPLOAD_FOLDER, filename)

    try:
        image = Image.open(file.stream)
        if resize_to:
            image = image.convert('RGB') if image.mode not in ('RGB', 'RGBA') else image
            image = image.resize(resize_to, Image.LANCZOS)
        image.save(filepath, optimize=True, quality=85)
    except Exception:
        try:
            file.stream.seek(0)
        except Exception:
            pass
        file.save(filepath)

    return f"uploads/{filename}", None


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

    # Create project_images table for multiple images per project
    db.execute('''
        CREATE TABLE IF NOT EXISTS project_images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            image_url TEXT NOT NULL,
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        )
    ''')

    # Create settings table for site details and contact info
    db.execute('''
        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            site_name TEXT NOT NULL,
            tagline TEXT NOT NULL,
            about TEXT NOT NULL,
            location TEXT NOT NULL,
            contact_email TEXT NOT NULL,
            whatsapp TEXT,
            phone TEXT,
            map_query TEXT NOT NULL,
            hero_image_url TEXT DEFAULT ''
        )
    ''')

    existing_settings_columns = [row['name'] for row in db.execute("PRAGMA table_info(settings)").fetchall()]
    if 'hero_image_url' not in existing_settings_columns:
        db.execute("ALTER TABLE settings ADD COLUMN hero_image_url TEXT DEFAULT ''")

    cursor = db.execute('SELECT COUNT(*) AS count FROM settings').fetchone()
    if cursor['count'] == 0:
        db.execute('''
            INSERT INTO settings (id, site_name, tagline, about, location, contact_email, whatsapp, phone, map_query, hero_image_url)
            VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            'Anjani',
            'MCA Graduate & Python Developer',
            'I build clean and modern Python web apps with intuitive design and admin controls.',
            'Noida Sector 22, India',
            'anjani@example.com',
            '919999999999',
            '+91 99999 99999',
            'Noida Sector 22, India',
            ''
        ))
    db.commit()
    db.close()

# --- PUBLIC ROUTES ---
@app.route('/')
def index():
    db = get_db()
    projects = db.execute('SELECT * FROM projects').fetchall()
    settings = db.execute('SELECT * FROM settings WHERE id = 1').fetchone()
    materials = []
    if session.get('is_subscriber'):
        materials = db.execute('SELECT * FROM materials').fetchall()
    
    # Fetch images for each project
    projects_data = []
    for p in projects:
        images = db.execute('SELECT * FROM project_images WHERE project_id = ? ORDER BY uploaded_at DESC', (p['id'],)).fetchall()
        projects_data.append({
            'project': p,
            'images': list(images) if images else []
        })
    
    db.close()
    return render_template('index.html', projects_data=projects_data, materials=materials, settings=settings)

# --- SUBSCRIBER LOGIN ---
@app.route('/subscriber_login', methods=['POST'])
def sub_login():
    auth_type = request.form.get('auth_type', 'sign-in')
    email = request.form.get('email')
    password = request.form.get('password')
    name = request.form.get('name')

    if auth_type == 'sign-up' and email and password and name:
        session['is_subscriber'] = True
        session['subscriber_email'] = email
        session['subscriber_name'] = name
        session['subscriber_password'] = password
        session['user_email'] = email
    elif auth_type == 'sign-in' and email and password:
        if session.get('subscriber_email') == email and session.get('subscriber_password') == password:
            session['is_subscriber'] = True
            session['user_email'] = email
        else:
            flash('Subscriber login failed. Please sign up first or use the correct credentials.')
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
    return render_template('login.html', admin=True)

@app.route('/admin/dashboard', methods=['GET', 'POST'])
def admin_dashboard():
    if not session.get('is_admin'):
        return redirect(url_for('admin'))
    db = get_db()
    settings = db.execute('SELECT * FROM settings WHERE id = 1').fetchone()
    
    if request.method == 'POST':
        redirect_url = url_for('admin_dashboard')
        form_type = request.form.get('form_type', 'project')
        
        if form_type == 'settings':
            site_name = request.form['site_name']
            tagline = request.form['tagline']
            about = request.form['about']
            location = request.form['location']
            contact_email = request.form['contact_email']
            whatsapp = request.form['whatsapp']
            phone = request.form['phone']
            map_query = request.form['map_query']
            hero_image_url = settings['hero_image_url'] if settings else ''

            site_image = request.files.get('site_image')
            if site_image and site_image.filename != '':
                if allowed_file(site_image.filename):
                    is_valid, message = validate_image(site_image)
                    if is_valid:
                        img_path, error = save_uploaded_image(site_image)
                        if img_path:
                            hero_image_url = img_path
                        else:
                            flash(f"Image upload failed: {error}")
                    else:
                        flash(f"Image validation failed: {message}")
                else:
                    flash("Invalid image type for website image.")

            db.execute('''
                UPDATE settings
                SET site_name = ?, tagline = ?, about = ?, location = ?, contact_email = ?, whatsapp = ?, phone = ?, map_query = ?, hero_image_url = ?
                WHERE id = 1
            ''', (site_name, tagline, about, location, contact_email, whatsapp, phone, map_query, hero_image_url))
            db.commit()
            flash("Website details updated successfully!")
        
        elif form_type == 'edit_project':
            project_id = request.form['project_id']
            title = request.form['title']
            desc = request.form['desc']
            stack = request.form['stack']
            git = request.form['git']
            
            db.execute('''
                UPDATE projects
                SET title = ?, description = ?, stack = ?, github_url = ?
                WHERE id = ?
            ''', (title, desc, stack, git, project_id))
            db.commit()
            flash("Project updated successfully!")
        
        elif form_type == 'add_images':
            project_id = request.form['project_id']
            files = request.files.getlist('images')
            
            if not files or files[0].filename == '':
                flash("No images selected")
            else:
                for file in files:
                    if file and allowed_file(file.filename):
                        is_valid, message = validate_image(file)
                        if is_valid:
                            img_path, error = save_uploaded_image(file, resize_to=(FIXED_WIDTH, FIXED_HEIGHT))
                            if img_path:
                                db.execute(
                                    'INSERT INTO project_images (project_id, image_url) VALUES (?, ?)',
                                    (project_id, img_path)
                                )
                            else:
                                flash(f"Error saving image: {error}")
                        else:
                            flash(f"Image validation failed: {message}")
                    else:
                        flash(f"Invalid file: {file.filename}")
                db.commit()
                flash("Images uploaded successfully!")
                redirect_url = url_for('admin_dashboard', open_edit=project_id)
        
        elif form_type == 'replace_image':
            image_id = request.form['image_id']
            new_file = request.files.get('image')
            if new_file and new_file.filename != '':
                if allowed_file(new_file.filename):
                    is_valid, message = validate_image(new_file)
                    if is_valid:
                        existing = db.execute('SELECT image_url FROM project_images WHERE id = ?', (image_id,)).fetchone()
                        if existing:
                            old_filepath = os.path.join('static', existing['image_url'])
                            if os.path.exists(old_filepath):
                                os.remove(old_filepath)
                            img_path, error = save_uploaded_image(new_file)
                            if img_path:
                                db.execute('UPDATE project_images SET image_url = ?, uploaded_at = CURRENT_TIMESTAMP WHERE id = ?', (img_path, image_id))
                                db.commit()
                                flash("Image replaced successfully!")
                            else:
                                flash(f"Error replacing image: {error}")
                        else:
                            flash("Original image not found.")
                    else:
                        flash(f"Image validation failed: {message}")
                else:
                    flash("Invalid file type for replacement.")
            else:
                flash("No replacement image chosen.")

        elif form_type == 'delete_image':
            image_id = request.form['image_id']
            image = db.execute('SELECT image_url FROM project_images WHERE id = ?', (image_id,)).fetchone()
            if image:
                filepath = os.path.join('static', image['image_url'])
                if os.path.exists(filepath):
                    os.remove(filepath)
                db.execute('DELETE FROM project_images WHERE id = ?', (image_id,))
                db.commit()
                flash("Image deleted!")
        
        else:  # Add new project
            title = request.form['title']
            desc = request.form['desc']
            stack = request.form['stack']
            git = request.form['git']
            
            cursor = db.execute(
                'INSERT INTO projects (title, description, stack, image_url, github_url) VALUES (?,?,?,?,?)',
                (title, desc, stack, '', git)
            )
            db.commit()
            project_id = cursor.lastrowid
            
            files = request.files.getlist('images')
            if files and files[0].filename != '':
                for file in files:
                    if file and allowed_file(file.filename):
                        is_valid, message = validate_image(file)
                        if is_valid:
                            img_path, error = save_uploaded_image(file, resize_to=(FIXED_WIDTH, FIXED_HEIGHT))
                            if img_path:
                                db.execute(
                                    'INSERT INTO project_images (project_id, image_url) VALUES (?, ?)',
                                    (project_id, img_path)
                                )
                            else:
                                flash(f"Error: {error}")
                        else:
                            flash(f"Image validation failed: {message}")
                db.commit()
            
            flash("Project Added Successfully!")
        db.close()
        return redirect(redirect_url)
    
    # Fetch projects with their images
    projects = db.execute('SELECT * FROM projects').fetchall()
    projects_data = []
    for p in projects:
        images = db.execute('SELECT * FROM project_images WHERE project_id = ? ORDER BY uploaded_at DESC', (p['id'],)).fetchall()
        projects_data.append({
            'project': p,
            'images': images
        })
    
    db.close()
    return render_template('admin_dashboard.html', projects_data=projects_data, settings=settings)


# --- NEW: DELETE PROJECT ROUTE ---
@app.route('/admin/delete/<int:id>')
def delete_project(id):
    if not session.get('is_admin'): 
        return redirect(url_for('admin'))
    db = get_db()
    
    # Delete associated images
    images = db.execute('SELECT image_url FROM project_images WHERE project_id = ?', (id,)).fetchall()
    for img in images:
        filepath = os.path.join('static', img['image_url'])
        if os.path.exists(filepath):
            os.remove(filepath)
    
    db.execute('DELETE FROM project_images WHERE project_id = ?', (id,))
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