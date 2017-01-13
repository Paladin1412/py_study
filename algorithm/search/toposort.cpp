#include <iostream>
#include <stdlib.h>
#include <stdio.h>
#include <cstring>
#define MAX 100
using namespace std;

void toposort(int map[MAX][MAX],int indegree[MAX],int n)
{
    int i,j,k;
    for(i=0;i<n;i++) //遍历n次
    {
        for(j=0;j<n;j++) //找出入度为0的节点
        {
            if(indegree[j]==0)
            {
                indegree[j]--;
                cout<<j<<endl;
                for(k=0;k<n;k++) //删除与该节点关联的边
                {
                    if(map[j][k]==1)
                    {
                        indegree[k]--;
                    }
                }
                break;
            }
        }
    }
}


int main(void)
{
    int n,m; //n:关联的边数，m:节点数
    printf("please input edge num  and node num: \n");
    while( scanf("%d %d",&n,&m) == 2 && n!=0 )
    {
        int i;
        int x,y;
        int map[MAX][MAX]; //邻接矩阵
        int indegree[MAX]; //入度
        memset(map,0,sizeof(map));
        memset(indegree,0,sizeof(indegree));
        for(i=0;i<n;i++)
        {
            scanf("%d %d",&x,&y);
            if(!map[x][y])
            {
                map[x][y]=1;
                indegree[y]++;
            }
        }
        toposort(map,indegree,m);
    }
    return 0;
}
