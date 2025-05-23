import eventlet
eventlet.monkey_patch()
from flask import *
from flask_socketio import *
import uuid
import logging
import time
import redis

logger = logging.getLogger('werkzeug')
logger.setLevel(logging.ERROR)

r = redis.Redis(host='localhost', port=6379, db=0)

app = Flask(__name__)
app.config['SECRET_KEY'] = 'ohioskibidiohiorizzlercheese!'
socketio = SocketIO(app,
                    #message_queue='redis://localhost:6379',
                    cors_allowed_origins="*",
                    async_mode='eventlet')
app.config['CORS_HEADERS'] = 'Content-Type'

sid_to_userid = {}
userid_to_sid = {}

players = {}
MAX_REQUESTS_PER_SECOND = 30
rate_limit_window = 1.0
rate_limits = {}

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('disconnect')
def handle_user_disconnect():
    sid = request.sid
    user_id = sid_to_userid.get(sid)

    if user_id is not None:
        del sid_to_userid[sid]
        del userid_to_sid[user_id]
        del players[user_id]
        emit('user_disconnected', {'user_id': user_id}, broadcast=True)
    else:
        pass#print(f"User {sid} not found in sid_to_userid.")

@socketio.on('manual_disconnect')
def handle_manual_disconnect():
    sid = request.sid
    user_id = sid_to_userid.get(sid)

    if user_id is not None:
        del sid_to_userid[sid]
        del userid_to_sid[user_id]
        del players[user_id]
        emit('user_disconnected', {'user_id': user_id}, broadcast=True)
    else:
        pass#print(f"User {sid} not found in sid_to_userid.") - Happens even it successfully disconnects

@socketio.on('connect')
def handle_user_connect():
    pass

@socketio.on('send_message')
def send_user_message(data):
    username = data['username']
    message = data['message']
    user_id = data['user_id']
    sid = request.sid

    if userid_to_sid.get(user_id) != sid:
        emit('error', {'message': 'User ID does not match session ID'}, room=request.sid)
        return

    #Validate the message

    if message == '' or len(message) > 100:
        emit('receive_error', { "message": "Sorry that message... Is not allowed" }, room=request.sid) 
        return

    if username == '' or len(username) > 20:
        emit('receive_error', { "message": "Sorry that username... Is not allowed its too... RAMBUMCTIOUS! ... Or it's beacause you haven't set your username with /username yet!" }, room=request.sid) 
        return

    user_id = sid_to_userid.get(sid)

    if user_id is not None:
        emit('receive_message', {'user_id': user_id, 'username': username, 'message': message}, broadcast=True)
    else:
        emit('error', {'message': 'User not found, perhaps refresh your page?'}, room=request.sid)

@socketio.on('update_position')
def update_position(data):
    user_id = data[0]
    sid = request.sid
    if userid_to_sid.get(user_id) != sid:
        emit('error', {'message': 'User ID does not match session ID'}, room=request.sid)
        return
    
    x = data[1]
    y = data[2]

    now = time.time()

    requests = rate_limits.setdefault(sid, [])
    requests = [t for t in requests if now - t < rate_limit_window]
    rate_limits[sid] = requests

    if len(requests) >= MAX_REQUESTS_PER_SECOND:
        return  #Drop the request if rate limit exceeded

    requests.append(now)
    rate_limits[sid] = requests

    if user_id in players:
        players[user_id]['x'] = x
        players[user_id]['y'] = y

        emit('position_update', {'user_id': user_id, 'x': x, 'y': y}, broadcast=True)
    else:
        emit('error', {'message': 'User not found'}, room=request.sid)

@socketio.on('join')
def on_join(data):
    allowed_colors = ['red', 'blue', 'yellow', 'purple', 'orange', 'white']
    is_the_owner = str(data['initial'])
    color_to_assign = str(data['colour'])

    if color_to_assign not in allowed_colors:
        emit('receive_error', { "message": "Sorry that color... Is not allowed" }, room=request.sid) 
        return

    if sid_to_userid.get(request.sid) is not None:
        emit('receive_error', { "message": "Sorry that user... Is already connected" }, room=request.sid) 
        return

    sid = request.sid
    userIdToAssign = str(uuid.uuid4())
    sid_to_userid[sid] = userIdToAssign
    userid_to_sid[userIdToAssign] = sid
    emit('assign_user_id', {'user_id': userIdToAssign, 'prev_players': players }, room=sid)
    
    players[userIdToAssign] = {'x': 100, 'y': 100, "colour": color_to_assign}#Add player to the dict after sending all prevous players
    
    emit('user_connected', {'user_id': userIdToAssign, "colour": color_to_assign}, broadcast=True)

    if is_the_owner == 'true':
        js_code = f"""console.log("The owner is here!");
        document.getElementById("{userIdToAssign}").style.backgroundColor = "green";
        document.querySelector(".information").innerHTML = "THE CREATOR IS HERE!";
        """
        emit("some_functin_idek_what_this_does", js_code, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=80, debug=True)
