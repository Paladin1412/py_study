from urllib.request import urlopen
from threading import Thread
from time import sleep

def dos(name, url='http://localhost:8080', num=60, delay=0.1):
    for i in range(num):
        urlopen(url)
        print(name, '发动攻击', i+1)
        sleep(delay)

Thread(target=dos, args=('唐僧',)).start()
Thread(target=dos, args=('悟空',)).start()
Thread(target=dos, args=('八戒',)).start()
Thread(target=dos, args=('沙僧',)).start()
Thread(target=dos, args=('龙马',)).start()
