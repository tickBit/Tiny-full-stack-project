from flask_socketio import SocketIO, emit
from flask import Flask, request
import flask
import json
from flask_cors import CORS, cross_origin
import vlc                          # pip install python-vlc
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import os

p = None

app = Flask(__name__)

CORS(app, origin="*")

socketio = SocketIO(app, cors_allowed_origins="*")


class MyHandler(FileSystemEventHandler):
    def __init__(self):
        pass

    def on_created(self, event):
        print(f'event type: {event.event_type}  path : {event.src_path}')
        
        files = [f for f in os.listdir("./music/") if os.path.isfile(os.path.join("./music/", f))]
        files = [os.path.join("./music/", f) for f in files]
        files.sort(key=lambda x: os.path.getmtime(x))
        
        print(files)

        message = ""
        for f in files:
            message += str(f).replace("./music/", "")+"\n"
        print(message)
        handle_message(message)

@socketio.on('connect')
def send_file_list():
    # Send filelist to client side during init..

    files = [f for f in os.listdir("./music/") if os.path.isfile(os.path.join("./music/", f))]
    files = [os.path.join("./music/", f) for f in files]
    files.sort(key=lambda x: os.path.getmtime(x))  

    message = ""
    for f in files:
        message += str(f).replace("./music/", "")+"\n"
    
    print(message)
    handle_message(message)

@socketio.on('message')
def handle_message(message):
    print('received message: ' + message)
    socketio.send(message)


@app.route("/comments", methods=["GET", "POST"])
def get_comments():

    comments = ""

    if request.method == "POST":

        try:
            with open("./data/comments.txt", "r", encoding="utf-8") as f:
                for line in f:
                    comments += line
        except:
            pass
    
    return_data = {
            "status": "success",
            "comments": comments
        }

    return flask.Response(response=json.dumps(return_data), status=201)
    
@app.route("/comments/<i>", methods=["GET", "POST"])
def get_Ncomments(i):

    comments = ""

    if request.method == "POST":

        try:
            with open("./data/comments.txt", "r", encoding="utf-8") as f:
                for line in f:
                    print(line)
                    prefix = "#"+str(i)
                    print(prefix)
                    if prefix in line: comments += line.replace(prefix, "")
        except:
            pass
    
    return_data = {
            "status": "success",
            "tune": i,
            "comments": comments
        }

    return flask.Response(response=json.dumps(return_data), status=201)

@app.route('/play/<message>', methods=["GET", "POST"])
def play_tune(message):
    global p
    
    print("Play endpoint reached...")
    
    if request.method == "GET":
        if p != None: p.stop()
        p = vlc.MediaPlayer("./music/"+message)
        p.play()

        return flask.jsonify({"Message": "Playing..."})

@app.route('/stop', methods=["GET", "STOP"])
def stop_tune():
    global p
    print("Stop tune endpoint reached...")
    if request.method == "GET":
        if p != None:
            p.stop()
            p = None

        return flask.jsonify({"Message": "Stopping playback..."})
    
@app.route('/comment', methods=["GET", "POST"])
def get_comment():
    print("Comment received...")
    if request.method == "POST":
        received_comment = request.get_json()
        print(f"received comment: {received_comment}")
        message = received_comment['data']

        with open("./data/comments.txt", "a", encoding="utf-8") as f:
            f.writelines(message)
            f.write("*END_OF_COMMENT*")
            f.write("\n")
            
        return_data = {
            "status": "success",
            "message": f"received: {message}"
        }

        return flask.Response(response=json.dumps(return_data), status=201)

@app.route('/upload', methods=['POST'])
def upload_file():
        
    if 'file' not in request.files:
        return 'No file part'
    
    file = request.files['file']

    if file.filename == '':
        return 'No selected file'    

    if file and file.filename.endswith('.mp3'):
        file.save('./music/' + file.filename)

        return 'File uploaded successfully'

    return 'Unsupported file format'

if __name__ == "__main__":
    event_handler = MyHandler()
    observer = Observer()
    observer.schedule(event_handler, path='./music/', recursive=False)
    observer.start()
    socketio.run(app, port=6969, debug=True)
