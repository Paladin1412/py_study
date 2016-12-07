连续子数组最大和
1. 问题描述

输入一个整形数组，求数组中连续的子数组使其和最大。比如，数组x


应该返回 x[2..6]的和187.

2. 问题解决

我们很自然地能想到穷举的办法，穷举所有的子数组的之和，找出最大值。

穷举法

i, j的for循环表示x[i..j]，k的for循环用来计算x[i..j]之和。

maxsofar = 0
for i = [0, n)
    for j = [i, n)
        sum = 0
        for k = [i, j]
            sum += x[k]
        /* sum is sum of x[i..j] */
        maxsofar = max(maxsofar, sum)
有三层循环，穷举法的时间复杂度为O(n3)O(n3)
对穷举法的改进1

我们注意到x[i..j]之和 = x[i..j-1]之和 + x[j]，因此在j的for循环中，可直接求出sum。

maxsofar = 0
for i = [0, n)
    sum = 0
    for j = [i, n)
        sum += x[j]
        /* sum is sum of x[i..j] */
        maxsofar = max(maxsofar, sum)
显然，改进之后的时间复杂度变为O(n2)O(n2)。

对穷举法的改进2

在计算fibonacci数时，应该还有印象：用一个累加数组（cumulative array）记录前面n-1次之和，计算当前时只需加上n即可。同样地，我们用累加数组cumarr记录：cumarr[i] = x[0] + . . . +x[i]，那么x [i.. j]之和 = cumarr[j] -cumarr[i - 1]。

cumarr[-1] = 0
for i = [0, n)
    cumarr[i] = cumarr[i-1] + x[i]
    
maxsofar = 0
for i = [0, n)
    for j = [i, n)
        sum = cumarr[j] - cumarr[i-1]
        /* sum is sum of x[i..j] */
        maxsofar = max(maxsofar, sum)
时间复杂度依然为O(n2)O(n2)。

分治法

所谓分治法，是指将一个问题分解为两个子问题，然后分而解决之。具体步骤如下：

先将数组分为两个等长的子数组a, b；


分别求出两个数组a，b的连续子数组之和；


还有一种情况（容易忽略）：有可能最大和的子数组跨越两个数组；


最后比较mama, mbmb, mcmc，取最大即可。

在计算mcmc时，注意：mcmc必定包含总区间的中间元素，因此求mcmc等价于从中间元素开始往左累加的最大值 + 从中间元素开始往右累加的最大值。

float maxsum3(l, u)
    if (l > u) /* zero elements */
        return 0
        
    if (l == u) /* one element */
        return max(0, x[l])
    
    m = (l + u) / 2
    /* find max crossing to left */
    lmax = sum = 0
    for (i = m; i >= l; i--)
        sum += x[i]
        lmax = max(lmax, sum)
    
    /* find max crossing to right */
    rmax = sum = 0
    for i = (m, u]
        sum += x[i]
        rmax = max(rmax, sum)

    return max(lmax+rmax,
                maxsum3(l, m),
                maxsum3(m+1, u));
容易证明，时间复杂度为O(n∗log n)O(n∗log n)。

Kadane算法

Kadane算法又被称为扫描法，该算法用到了一个启发式规则：如果前面一段连续子数组的和小于0，那么就丢弃它。其实也蛮好理解的，举个简单例子，比如：数组-1, 2, 3，-1为负数，为了使得子数组之和最大，显然不应当把-1计入进内。

max_ending_here记录前面一段连续子数组之和。

Initialize:
    max_so_far = 0
    max_ending_here = 0

Loop for each element of the array
  (a) max_ending_here = max_ending_here + x[i]
  (b) if(max_ending_here < 0)
            max_ending_here = 0
  (c) if(max_so_far < max_ending_here)
            max_so_far = max_ending_here
return max_so_far
只遍历了一遍数组，因此时间复杂度为O(n)O(n)。



1. 分治法与动态规划主要共同点:
二者都要求原问题具有最优子结构性质,都是将原问题分而治之,分解成若干个规模较小(小到很容易解决的程序)的子问题.然后将子问题的解合并,形成原问题的解.
 
2. 分治法与动态规划实现方法:
① 分治法通常利用递归求解.
② 动态规划通常利用迭代法自底向上求解,但也能用具有记忆功能的递归法自顶向下求解.
 
3. 分治法与动态规划主要区别:
① 分治法将分解后的子问题看成相互独立的.
② 动态规划将分解后的子问题理解为相互间有联系,有重叠部分.
