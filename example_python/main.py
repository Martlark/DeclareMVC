import os
import random
import time

from flask import Flask, render_template, jsonify, request, current_app, send_from_directory

CDN_FOLDER = '..'
app = Flask(__name__)


@app.route('/')
def page_index():
    return render_template('index.html')


@app.route('/codesandbox')
def page_codesandbox():
    return render_template('codesandbox.html')


@app.route('/names')
def api_names():
    return jsonify([dict(id=x + 1, name=f'Name {1 + x}', title='Mr', checked=x % 2) for x in range(5)])


@app.route('/slow_names')
def api_slow_names():
    time.sleep(2.2)
    return jsonify([dict(id=x + 1, name=f'Name {1 + x}', title='Mr') for x in range(5)])


@app.route('/shutdown')
def testing_shutdown():
    if app.testing:
        func = request.environ.get('werkzeug.server.shutdown')
        if func is None:
            raise RuntimeError('Not running with the Werkzeug Server')
        func()
        return 'shutdown'
    return 'not testing'


@app.route('/cdn/<file_name>')
def cdn_serve(file_name):
    return send_from_directory(CDN_FOLDER, os.path.basename(file_name))


@app.route('/ajax/<int:value>')
def route_ajax(value):
    time.sleep(0.2)
    if value == 5:
        raise Exception('5 is a bad number')
    return str(value * 2)


rand_check_number = random.randint(0, 9999999999)


@app.route('/last_static_update')
def last_static_update():
    include_dirs = [CDN_FOLDER, './static', './templates']
    exclude_dir = ['node_modules', 'venv', 'tmp']
    notice_exts = ['js', 'html', 'css', 'jsx']
    initial_max_age = max_age = float(request.args.get('max_age', -1))
    for include_dir in include_dirs:
        for root, dirs, files in os.walk(include_dir):
            if os.path.basename(root) not in exclude_dir:
                for file in files:
                    if any([file.endswith(ext) for ext in notice_exts]):
                        full_path = os.path.join(root, file)
                        mtime = os.path.getmtime(full_path)
                        if mtime > max_age and initial_max_age != -1:
                            current_app.logger.debug(
                                'Refresh required because of:{full_path}'.format(full_path=full_path))
                        max_age = max(max_age, mtime)

    if request.args.get('rand_check_number'):
        if int(request.args.get('rand_check_number')) != rand_check_number:
            current_app.logger.debug(
                'Refresh required because of:rand_check_number')
    return jsonify(dict(max_age=max_age, rand_check_number=rand_check_number))
