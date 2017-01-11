# coding=utf-8

from django.db import models
from django.utils import timezone
from core.product.models import Product,Modules
from core.interface.models import Testcase
from core.adminlte.constants import TestcaseRes,EndSheduleTime
import datetime

class CasesetManager(models.Manager):
	def with_case_count(self):
		from django.db import connection
		cursor = connection.cursor()
		cursor.execute("""select ca.id,ca.set_name,ca.product_id,ca.set_desc,ca.updated_time,ca.runresult,count(cat.testcase_id)
						 from caseset_caseset ca
						 left join caseset_casesettotestcase cat
						on ca.id = cat.caseset_id group by cat.caseset_id
						 """)
		result_list = []
		for row in cursor.fetchall():
			p = self.model(id=row[0], set_name=row[1], product_id=row[2],set_desc=row[3],updated_time=row[4],runresult=row[5])
			p.count_cases = row[6]
			result_list.append(p)
		return result_list

# Create your models here.
class Caseset(models.Model):
	set_name = models.CharField(verbose_name='用例集名称', max_length=50, unique=True)
	set_desc = models.CharField(verbose_name='用例集描述', max_length=100)
	product = models.ForeignKey(Product, verbose_name='产品id')
	module = models.ForeignKey(Modules, verbose_name='模块id',null=True, blank=True,default=None)
	scheduled = models.BooleanField(verbose_name='是否定时', default=False)
	scheduled_info = models.CharField(verbose_name='定时设置信息', max_length=100,default=None)
	status = models.BooleanField(verbose_name='状态', default=True)
	created_time = models.DateTimeField(verbose_name='创建时间', auto_created=True,default=timezone.now)
	updated_time = models.DateTimeField(verbose_name='最新运行时间', null=True, blank=True,default=None)
	runresult = models.PositiveSmallIntegerField(
		u'执行结果', choices=TestcaseRes.CHOICES,
		default=TestcaseRes.NOTRUN
	)
	objects = CasesetManager()

	def __unicode__(self):
		return self.set_name

	def get_schedule_starttime(self):
		if self.scheduled and self.scheduled_info:
			starttime = self.scheduled_info.split('||')[0].strip()

			print "hhh %s, after is %s"%(starttime,datetime.datetime.strptime(starttime,'%Y-%m-%d'))
			return datetime.datetime.strptime(starttime, '%Y-%m-%d')
		return False

	def get_schedule_radio(self):
		if self.scheduled and self.scheduled_info:
			return self.scheduled_info.split('||')[1]

	def get_schedule_endtime(self):

		if self.scheduled and self.scheduled_info:
			endtime = self.scheduled_info.split('||')[2]
			if endtime.find(EndSheduleTime) > -1:
				return "unlimited"
			else:
				return datetime.datetime.strptime(endtime, '%Y-%m-%d')
		return  False


	class Meta:
		verbose_name_plural = '冒烟用例集合'
		verbose_name = '冒烟用例集合'

class CasesetToTestcase(models.Model):
	caseset = models.ForeignKey(Caseset, verbose_name='冒烟测试用例集')
	testcase = models.ForeignKey(Testcase, verbose_name='测试用例')

	class Meta:
		unique_together = (('caseset', 'testcase'),)

