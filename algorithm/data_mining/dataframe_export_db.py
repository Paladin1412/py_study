#!/bin/env python
#-*- coding: UTF-8 -*-

import pandas as pd
import MySQLdb

def export_db(db_con, db_name):
    df = pd.read_sql('select * from '+str(db_name), con=db_con)
    #tmp = pd.DataFrame(df, index=df['id']).drop(['id'], axis=1).drop(['time'], axis=1).drop(['content'], axis=1)
    df.index=df['id']
    df = df.drop(['id'], axis=1)
    print df
    #df.to_csv(db_name + '.csv') #对于中文处理不太好
    df.to_excel(db_name + '.xls', sheet_name=db_name)
    print "save to %s.xls finished" % (db_name)

mysql_con = MySQLdb.connect(host='172.30.2.10', port=6606, user='se', passwd='123456', db='folio', charset='utf8')
export_db(mysql_con, 'folio_result_code')
mysql_con.close()
#csv = pd.read_csv('folio_result_code.csv')
excel = pd.read_excel('folio_result_code.xls')
print excel

