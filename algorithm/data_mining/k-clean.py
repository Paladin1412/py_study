#!/bin/env python
#-*- coding: UTF-8 -*-

'''
什么是K-近邻算法？
简单的说，K-近邻算法就是采用测量不同特征值之间的距离方法来进行分类。它的工作原理是：存在一个样本数据集合，也称作训练样本集，并且样本集中每个数据都存在标签，即我们知道样本集中每一数据与所属分类的对应关系，输入没有标签的新数据之后，将新数据的每个特征与样本集中数据对应的特征进行比较，然后算法提取出样本集中特征最相似数据的分类标签。一般来说，我们只选择样本数据集中前k个最相似的数据，这就是K-近邻算法名称的由来。

K-近邻算法是属于是监督学习
实现K-近邻算法
K-近邻算法的具体思想如下：

（1）计算已知类别数据集中的点与当前点之间的距离

（2）按照距离递增次序排序

（3）选取与当前点距离最小的k个点

（4）确定前k个点所在类别的出现频率

（5）返回前k个点中出现频率最高的类别作为当前点的预测分类
'''


from numpy import *
import operator

group = array([[1.0,1.1],[1.0,1.0],[0,0],[0,0.1]])
labels = ['A','A','B','B']


def classify(inX, dataSet, labels, k):
    dataSetSize = dataSet.shape[0]  
    diffMat = tile(inX, (dataSetSize,1)) - dataSet
    print diffMat
    sqDiffMat = diffMat**2
    sqDistances = sqDiffMat.sum(axis=1)
    distances = sqDistances**0.5
    print distances
    sortedDistances = distances.argsort() #返回的是从小到大排序之后的索引列表,即找到距离最小的前三个
    print sortedDistances
    classCount = {}
    for i in range(k):
        numOflabel = labels[sortedDistances[i]]
        classCount[numOflabel] = classCount.get(numOflabel,0) + 1
    print classCount
    sortedClassCount = sorted(classCount.iteritems(), key=operator.itemgetter(1),reverse=True)  #按照第二个元素排序，结果降序排列，即找到频率最高的K个
    print sortedClassCount
    return sortedClassCount[0][0]

my = classify([0,0], group, labels, 3)
print my
