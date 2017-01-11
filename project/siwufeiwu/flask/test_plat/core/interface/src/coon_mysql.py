# coding=utf-8
import sys
reload(sys)  
sys.setdefaultencoding('utf8') 
import MySQLdb
class run_sql(object):
	def __init__(self,host,user,passwd,db,sql,port=3306):
		self.host=host
		self.user=user
		self.passwd=passwd
		self.port=port
		self.db=db
		self.sql=sql
	def coon_db(self):
		try:
			coon = MySQLdb.connect(host=self.host,user=self.user,passwd=self.passwd,port=self.port,db=self.db,charset='utf8',connect_timeout=3)
		except Exception,e:
			return 'error,数据库连接失败，错误信息：%s'%e
		else:
			course = coon.cursor()
			try:
				sqls = self.sql.split(';')
				for sql in sqls:
					if sql !='':
						course.execute(self.sql)
						coon.commit()
			except Exception,e:
				return 'error,sql有误，请检查sql，错误信息%s'%e
			else:
				return 'success,sql执行成功'
			finally:
				course.close()
				coon.close()
if __name__=='__main__':
	select_sql='select * from test;'
	insert_sql = 'insert into test (name) VALUE ("test2");'
	p=run_sql(host='10.164.96.205',user='root',passwd='123456',db='adcpm',sql=insert_sql)
	p.coon_db()

