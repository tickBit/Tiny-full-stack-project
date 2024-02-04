from flask import Flask, request
import flask
import json
from flask_cors import CORS
import vlc                          # pip install python-vlc

app = Flask(__name__)
CORS(app)

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
    

@app.route('/play', methods=["GET", "POST"])
def play_tune():
    print("Play endpoint reached...")
    if request.method == "GET":
        p = vlc.MediaPlayer("./music/Terminator_memories.mp3")
        p.play()

        # p.stop()
        return flask.jsonify({"Message": "Playing..."})

@app.route('/comment', methods=["GET", "POST"])
def get_comment():
    print("Comment received...")
    if request.method == "POST":
        received_comment = request.get_json()
        print(f"received comment: {received_comment}")
        message = received_comment['data']

        with open("./data/comments.txt", "a", encoding="utf-8") as f:
            f.writelines(message)
            f.write("*END_OF_COMMENT*\n")

        return_data = {
            "status": "success",
            "message": f"received: {message}"
        }

        return flask.Response(response=json.dumps(return_data), status=201)
    
if __name__ == "__main__":
    app.run("localhost", 6969)