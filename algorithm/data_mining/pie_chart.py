#!/bin/env python
#-*- coding: UTF-8 -*-

import numpy as np
import matplotlib.pyplot as plt
 

'''
第三个脚本，script3.py 完成如下任务：

创建一个包含5个整数的列表
创建一个宽6英寸、高6英寸的图(赋值1）
添加一个长宽比为1的轴图
设置图的标题（字号为14）
用data列表画一个包含标签的饼状图
保存图为PNG格式)
'''


data =[33,25,20,12,10]
plt.figure(num=1, figsize=(6,6))
plt.axes(aspect=1)
plt.title('Plot 3', size=14)
plt.pie(data, labels=('Group 1','Group 2','Group 3','Group 4','Group 5'))
plt.savefig('images/pie_chart.png', format='png')
