#encoding=utf-8

__author__ = 'kevinlu1010@qq.com'

import traceback
from snack import *

screen = SnackScreen()  


def window1():
    btn1 = Button('按钮1')  
    btn2 = Button('按钮2')  #
    g = Grid(2, 1)   
    g.setField(btn1, 0, 0)  
    g.setField(btn2, 1, 0)
    screen.gridWrappedWindow(g, "我的界面1")
    f = Form() 
    f.add(g)    
    result = f.run()

    screen.popWindow()
    btn1.setCallback(window2())  #设置回调方法为界面2


def window2():
    def print_name(name):
        print '你的名称是：%s' % name

    label = Label('请输入名称：')  

    entry = Entry(10, '')  
    btn1 = Button('确定') 
    g = Grid(2, 2)   
    g.setField(label, 0, 0)  
    g.setField(entry, 1, 0)
    g.setField(btn1, 1, 1)
    screen.gridWrappedWindow(g, "我的界面2")
    f = Form()  #实例化一个form
    f.add(g)    #把网格填充到form
    result = f.run()

    screen.popWindow()
    btn1.setCallback(print_name(entry.value()))


def main():
    try:
        window1()
    except:
        print traceback.format_exc()
    finally:
        screen.finish()  #关闭snack界面
        return ''


main()