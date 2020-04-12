from flask import Flask, render_template, jsonify, request

app = Flask(__name__)


@app.route('/')
def page_index():
    return render_template('index.html')


@app.route('/names')
def api_names():
    return jsonify([dict(id=x + 1, name=f'Name {1 + x}', title='Mr') for x in range(5)])



@app.route('/about')
def public_about():
    return render_template("about.html", title="DeclareMVC Example and Testing application")

@app.route('/shutdown')
def testing_shutdown():
    if app.testing:
        func = request.environ.get('werkzeug.server.shutdown')
        if func is None:
            raise RuntimeError('Not running with the Werkzeug Server')
        func()
        return 'shutdown'
    return 'not testing'
