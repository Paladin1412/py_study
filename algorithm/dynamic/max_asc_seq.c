#include <stdio.h>
#define MAX 1000

int seq[MAX+10];
int seqlen[MAX+10];

int cmp(int x, int y)
{
    return x > y ? x : y;
}

int max_element(int *start, int *end)
{
    int *p, _max=0;
    for(p=start; p<=end; p++)
    {
        if( (*p) > _max )
        {
            _max = *p;
        }
    }
    return _max;
}

int main()
{
    int i, j, k, N=9, max, maxlen=1;
    for(i=1; i<=N;i++)
        seqlen[i] = 1;
    printf("please input %d num: \n", N);
    for(i=1;i<=N;i++)
        scanf("%d", &seq[i]);
    printf("max num is %d\n", max_element(seq+1, seq+9));
    
    /*i for everyone
    for(i=i; i<=N; i++)
    {
        for(j=i+1;j<=N;j++)
        {
            if(seq[j]>seq[i])
                seqlen[j] = cmp(seqlen[j], seqlen[i]+1);
        }
    }
    printf("max child seq lenth is %d\n", max_element(seqlen+1, seqlen+9));
    */
    ///* everyone for me
    for(i=2; i<=N; i++)
    {
        max=0;
        for(j=1;j<i;j++)
            if(seq[j]<seq[i] && seqlen[j]>max)
                max = seqlen[j];
        seqlen[i] = max + 1;
        if(seqlen[i]>maxlen)
            maxlen = seqlen[i];
    }
    printf("max child seq lenth is %d\n", max_element(seqlen+1, seqlen+9));
    //*/
    return 0;
}
