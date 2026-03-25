from flask import Flask
from flask_cors import CORS

from routes.auth import auth_bp
from routes.views import views_bp
from routes.face import face_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(auth_bp)
app.register_blueprint(views_bp)
app.register_blueprint(face_bp)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)