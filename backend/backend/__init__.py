# The __init__.py serves double duty: it will contain the application 
# factory, and it tells Python that the backend directory should be 
# treated as a package.
from flask import Flask
from flask_cors import CORS

# create and configure the app
app = Flask(__name__)
CORS(app)