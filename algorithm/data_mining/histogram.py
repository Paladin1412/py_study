#!/bin/env python
#-*- coding: UTF-8 -*-

import numpy as np
import matplotlib.pyplot as plt
 

'''
第二个脚本，script2.py 完成如下任务：

创建一个包含1000个随机样本的正态分布数据集。
创建一个宽8英寸、高6英寸的图(赋值1）
设置图的标题、x轴标签、y轴标签（字号均为14）
用samples这个数据集画一个40个柱状，边从-10到10的柱状图
添加文本,用TeX格式显示希腊字母mu和sigma(字号为16）
保存图片为PNG格式。
'''

mu =0.0
sigma =2.0
samples = np.random.normal(loc=mu, scale=sigma, size=1000)
plt.figure(num=1, figsize=(8,6))
plt.title('Plot 2', size=14)
plt.xlabel('value', size=14)
plt.ylabel('counts', size=14)
plt.hist(samples, bins=40, range=(-10,10))
plt.text(-9,100, r'$\mu$ = 0.0, $\sigma$ = 2.0', size=16)
plt.savefig('images/histogram.png', format='png')

