#coding=utf8
import gevent
 
def win():
    return 'You win!'
 
def fail():
    raise Exception('You failed!')
 
winner = gevent.spawn(win)
loser = gevent.spawn(fail)
 
print winner.started # True
print loser.started  # True
 
#在Greenlet中发生的异常，不会被抛到Greenlet外面。
#控制台会打出Stacktrace，但程序不会停止
try:
    gevent.joinall([winner, loser])
except Exception as e:
    # 这段永远不会被执行
    print 'This will never be reached'
 
print winner.ready() # True
print loser.ready()  # True
 
print winner.value # 'You win!'
print loser.value  # None
 
print winner.successful() # True
print loser.successful()  # False
 
# 这里可以通过raise loser.exception 或 loser.get()
# 来将协程中的异常抛出
print loser.exception


'''
获取协程状态

协程状态有已启动和已停止，分别可以用协程对象的”started”属性和”ready()”方法来判断。对于已停止的协程，可以用”successful()”方法来判断其是否成功运行且没抛异常。如果协程执行完有返回值，可以通过”value”属性来获取。另外，greenlet协程运行过程中发生的异常是不会被抛出到协程外的，因此需要用协程对象的”exception”属性来获取协程中的异常。下面的例子很好的演示了各种方法和属性的使用。
'''
