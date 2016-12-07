#include <iostream>
#include <stdio.h>
#include <algorithm>
using namespace std;

#define MAX 101
int a[MAX][MAX];
int n;
int *maxsum;

int main()
{
    int i,j,k=1;
    char s[MAX];
    cout << "please input num N: " << endl;
    cout << 5 << ' ' << 6 << " max value is: " << max(5,6) << endl;
    printf("%d\n", 123);
    sprintf(s, "%s\n", "12345");
    cout << s << endl;
    cin >> n;
    for(i=1;i<=n;i++)
    {
        for(j=1;j<=i;j++)
        {
            a[i][j] = k;
            cout << a[i][j] << ' ';
            k++;
        }
        cout << endl;
    }
    maxsum = a[n];
    for(i=n-1; i>=1; i--)
        for(j=1; j<=i; j++)
            maxsum[j] = max(maxsum[j], maxsum[j+1]) + a[i][j];
    cout << maxsum[1] << endl;
}
