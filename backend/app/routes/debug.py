from flask import Blueprint, jsonify, current_app
import os

bp = Blueprint('debug', __name__, url_prefix='/api')

@bp.route('/debug')
def debug():
    debug_info = {
        'environment': dict(os.environ),
        'flask_config': {
            key: str(value) for key, value in current_app.config.items()
            if not key.startswith('_')
        },
        'routes': [str(rule) for rule in current_app.url_map.iter_rules()]
    }
    return jsonify(debug_info) 