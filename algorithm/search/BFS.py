#coding:utf8


'''
图的搜索方法 分广度优先 和深度优先 两种, 这是最基本的图算法, 也是图算法的核心. 其他的图算法一般都是基于图搜索算法或是它的扩充.

广度优先搜索 (breadth-first search)
广度优先是最简单的图搜索算法之一, 也是许多重要的图算法的原型. 在Prim最小生成树算法和Dijkstra单源最短路径算法中, 都采用了类似的思想.
顾名思义, 给定一个源顶点s, 广度优先算法会沿其广度方向向外扩展, 即先发现和s距离为k的所有顶点, 然后才发现和s距离为k+1的所有顶点. 
显然这样的搜索方式, 按照节点被发现的顺序, 最终会生成一棵树, 称之为广度优先树 , 每个节点至多被发现一次(第一次, 后面再遍历到就不算了), 仅当节点被发现时, 他的前趋节点为他的父节点, 所以广度优先树又形式化的称为该图的前趋子图 .
我们还可以证明, 在广度优先树, 任意节点到源顶点s的距离(树高)为他们之间的最短距离 . 
这个很容易证明, 假设在广度优先树上该节点n到s的距离为k, 而n到s的最短距离为k-1.
由于是广度优先搜索, 必须要先发现和s距离为k-1的所有顶点, 然后才会去发现和s距离为k的顶点, 所以产生矛盾, 在广度优先树上距离应该是k-1, 而不可能是k, 从而得证这就是最短距离.
所以广度优先算法可用于求图中两点间(a,b)的无权最短路径. 方法首先以a为源求前趋子图(即广度优先树), 然后在树中找到b, 不断求其前趋, 到a为止, 中间经过的节点就是其最短路径. 如果无法达到a, 则a,b间不可达. 
实现如下, 在实现BFS算法时, 我们需要用到queue数据结构, 来存放仍需继续搜索的节点...
广度和深度优先搜索的 区别 
对于这两种算法基本的目的都是要遍历所有节点一次, 所以时间复杂度是一致的O(V+E)
两者在实现上唯一的区别是, BFS使用Queue, 而DFS使用Stack, 这就是两者所有区别的根源, Queue的先进先出特性确保了只有上一层的所有节点都被访问过, 才会开始访问下层节点, 从而保证了广度优先, 而Stack的先进后出的特性, 会从叶节点不断回溯, 从而达到深度优先.
两者应用场景不同, BFS比较简单, 主要用于求最短路径, DFS复杂些, 主要用于graph decomposition, 即怎样把一个图分解成相互连通的子图, 其中包含了有向图的拓扑排序问题.
'''


def BFS(graph, start):  
    parent = {start:None}  
    dist = {start:0}  
    queue = [start]  
      
    while queue:  
        v = queue.pop(0)  
        print v  
        e = graph[v]  
        for n in e:           
            if not parent.get(n) and not dist.get(n):  
               parent[n] = v  
               dist[n]= dist[v]+1  
               queue.append(n)  
            print n, parent[n], dist[n]  
    return parent  
               
def shortestPath(parent, start, end):  
    if start == end:   
        print start  
        return  
    p = parent.get(end)  
    if not p:   
        print 'no path'  
        return  
    shortestPath(parent, start, p)  
    print end  
if __name__ == "__main__":   
    graph = {'A': ['B', 'C','E'],  
             'B': ['A','C', 'D'],  
             'C': ['D'],  
             'D': ['C'],  
             'E': ['F','D'],  
             'F': ['C']}  
    p = BFS(graph,'A')  
    shortestPath(p, 'A', 'F')
