from flask import Blueprint, jsonify

main = Blueprint('main', __name__)

from . import api, debug

__all__ = ['api', 'debug']

debug = Blueprint('debug', __name__, url_prefix='/api')

@debug.route('/debug')
def get_debug_info():
    logs = {
        'user_data': '',
        'nginx_error': '',
        'backend_error': '',
        'backend': '',
        'netstat': ''
    }
    
    try:
        with open('/var/log/user-data.log', 'r') as f:
            logs['user_data'] = f.read()
    except:
        logs['user_data'] = 'Failed to read user-data.log'
        
    try:
        with open('/var/log/nginx/error.log', 'r') as f:
            logs['nginx_error'] = f.read()
    except:
        logs['nginx_error'] = 'Failed to read nginx error.log'
        
    try:
        with open('/var/log/backend.error.log', 'r') as f:
            logs['backend_error'] = f.read()
    except:
        logs['backend_error'] = 'Failed to read backend.error.log'
        
    try:
        with open('/var/log/backend.log', 'r') as f:
            logs['backend'] = f.read()
    except:
        logs['backend'] = 'Failed to read backend.log'
        
    try:
        import subprocess
        result = subprocess.run(['netstat', '-tlpn'], capture_output=True, text=True)
        logs['netstat'] = result.stdout
    except:
        logs['netstat'] = 'Failed to run netstat'
    
    return jsonify(logs)

# Register the blueprint
def init_app(app):
    app.register_blueprint(debug)
    app.register_blueprint(main) 