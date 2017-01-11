# coding=utf-8

from django.db import models
from core.adminlte.constants import TestcaseRes
from core.product.models import Product, Modules
from core.interface.models import Testcase
from core.caseset.models import Caseset

class Res(models.Model):
	case = models.ForeignKey(Testcase, verbose_name='用例id')
	caseset = models.ForeignKey(Caseset, verbose_name='用例集id',null=True, blank=True,default=None)
	res_status = models.PositiveSmallIntegerField(
		u'执行结果', choices=TestcaseRes.CHOICES,
		default=TestcaseRes.NOTRUN
	)
	response = models.CharField(verbose_name='返回报文', max_length=255)
	product = models.ForeignKey(Product, verbose_name='产品id')
	module = models.ForeignKey(Modules, verbose_name='模块id',null=True, blank=True,default=None)
	created_time = models.DateTimeField(verbose_name='创建时间', auto_now_add=True)
	elapsed_time = models.CharField(verbose_name='消耗时间',default=None,max_length=15)

	def __unicode__(self):
		return self.case_id

	class Meta:
		verbose_name_plural = '执行结果'
		verbose_name = '执行结果'