#!/bin/env python
#-*- coding: UTF-8 -*-

import numpy as np
import matplotlib.pyplot as plt
 

'''
第一个脚本，script1.py 完成如下任务:

创建3个数据集（xData,yData1和yData2)
创建一个宽8英寸、高6英寸的图(赋值1）
设置图画的标题、x轴标签、y轴标签（字号均为14）
绘制第一个数据集：yData1为xData数据集的函数，用圆点标识的离散蓝线，标识为"y1 data"
绘制第二个数据集：yData2为xData数据集的函数，采用红实线，标识为"y2 data"
把图例放置在图的左上角
保存图片为PNG格式文件
'''


xData = np.arange(0,10,1)
yData1 = xData.__pow__(2.0)
yData2 = np.arange(15,61,5)
print yData1, yData2
plt.figure(num=1, figsize=(8,6))
plt.title('Plot 1', size=14)
plt.xlabel('x-axis', size=14)
plt.ylabel('y-axis', size=14)
plt.plot(xData, yData1, color='b', linestyle='--', marker='o', label='y1 data')
plt.plot(xData, yData2, color='r', linestyle='-', marker='*', label='y2 data')
plt.legend(loc='upper left')
plt.savefig('images/discrete_linear.png', format='png')

