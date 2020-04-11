from flask import Flask, render_template, jsonify

app = Flask(__name__)


@app.route('/')
def page_index():
    return render_template('index.html')


@app.route('/names')
def api_names():
    return jsonify([dict(id=x + 1, name=f'Name {1+x}', title='Mr') for x in range(5)])
