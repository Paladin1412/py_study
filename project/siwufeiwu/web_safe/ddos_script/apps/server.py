from bottle import route, run, template, static_file
from collections import deque
from datetime import datetime
import os

html_str = '''
<html>
<head>
<meta charset="utf-8">
<title> DDOS模拟（服务端）</title>
</head>
<body>
<h1> 服务端是否忙碌：{{status}} </h1>
<h3> 这里的Web站点仅支持标准时钟间隔的每分钟{{limit}}以下的访问量，远小于实际情况，
     这样做的目的仅在于方便编程和模拟 </h3>
<center><img src="{{image}}"></center>
</body>
</html>
'''

def isBusy(limit=60):
    now = datetime.now()
    if not os.path.isfile('status.mk'):
        open('status.mk', 'w').write('{0},{1}\n'.format(now.hour, now.minute))
    d = deque(open('status.mk').readlines(), maxlen=30)
    d.append('{0},{1}\n'.format(now.hour, now.minute))
    open('status.mk', 'w').writelines(d)
    if len(d) >= 30 and d[0] == d[-1]:
        return True
    return False

@route('/')
def hello():
    limit = 60
    return template(html_str, status=('否', '是')[isBusy(limit)], limit=limit, image=('well.jpg', 'bad.jpg')[isBusy(limit)])

@route('/<filename:re:.*\.jpg>')
def sendImage(filename):
    root = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'image')
    print(root)
    return static_file(filename, root=root, mimetype='image/jpg')

import os
try:
    os.remove('status.mk')
except FileNotFoundError: pass
run(host='localhost', port=8080)
