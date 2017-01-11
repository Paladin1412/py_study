from tasks import add
import time
result = add.delay(4,4)

while not result.ready():
    print "not ready yet"
    time.sleep(2)
print result.get()
