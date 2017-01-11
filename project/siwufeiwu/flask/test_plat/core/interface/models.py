# coding=utf-8


from django.db import models
from core.adminlte.constants import InterfaceLevel, HttpMothod, TestcaseLevel, TestcaseRes
from core.product.models import Product, Modules
import ast

class Interface(models.Model):
	name = models.CharField(verbose_name='接口名称', null=False, max_length=80)
	req_url = models.CharField(verbose_name='请求url', null=False, max_length=100)
	reqmethod = models.PositiveSmallIntegerField(
		u'请求方式', choices=HttpMothod.CHOICES,
		default=HttpMothod.GET
	)
	detail = models.CharField(verbose_name='接口描述', max_length=100)
	product = models.ForeignKey(Product, verbose_name='产品id')
	module = models.ForeignKey(Modules, verbose_name='模块id')
	strong_field = models.CharField(verbose_name='校验健壮性字段', max_length=200, null=True)
	default_param = models.CharField(verbose_name='默认参数', max_length=255)
	reqheader = models.CharField(verbose_name='请求header', max_length=100, null=True)
	is_json = models.BooleanField(verbose_name='入参是否json', default=False)
	level = models.PositiveSmallIntegerField(
		u'接口优先级', choices=InterfaceLevel.CHOICES,
		default=InterfaceLevel.LOW
	)
	developer = models.IntegerField(verbose_name='开发人员用户id', default=None)
	status = models.BooleanField(verbose_name='接口状态', default=True)
	created_time = models.DateTimeField(verbose_name='创建时间', auto_now_add=True)
	updated_time = models.DateTimeField(verbose_name='修改时间', auto_now=True)

	def __unicode__(self):
		return self.name

	@property
	def countTestcase(self):
		return self.testcase_set.count()

	@property
	def getheadername(self):
		if self.reqheader:
			headers_dict = ast.literal_eval(self.reqheader)
			return headers_dict.keys()[0]
		else:
			return ''

	@property
	def getheadervalue(self):
		if self.reqheader:
			headers_dict = ast.literal_eval(self.reqheader)
			return headers_dict.values()[0]
		else:
			return ''

	class Meta:
		verbose_name_plural = '接口'
		verbose_name = '接口'


class Testcase(models.Model):
	modify_param = models.CharField(verbose_name='变化的参数', max_length=200, null=True)
	interface = models.ForeignKey(Interface, verbose_name='接口id')
	case_name = models.CharField(verbose_name='用例标题', max_length=100)
	case_detail = models.CharField(verbose_name='用例描述', max_length=100)
	code_check = models.IntegerField(verbose_name='状态码检查', null=True)
	res_check = models.CharField(verbose_name='返回值校验', max_length=200, null=True)
	caseresult = models.PositiveSmallIntegerField(
		u'执行结果', choices=TestcaseRes.CHOICES,
		default=TestcaseRes.NOTRUN
	)
	created_by = models.IntegerField(verbose_name='创建者')
	is_smoke = models.BooleanField(verbose_name='是否冒烟测试', default=False)
	count = models.IntegerField(verbose_name='执行次数', null=True, default=0)
	pass_count = models.IntegerField(verbose_name='通过次数', null=True, default=0)
	fail_count = models.IntegerField(verbose_name='失败次数', null=True, default=0)
	level = models.PositiveSmallIntegerField(
		u'用例优先级', choices=TestcaseLevel.CHOICES,
		default=TestcaseLevel.LOW
	)
	init_sql = models.CharField(verbose_name='初始化数据sql', null=True, max_length=100)
	delete_sql = models.CharField(verbose_name='清除数据sql', null=True, max_length=100)
	zento_bug_id = models.CharField(verbose_name='禅道编号', null=True, max_length=10)
	tester = models.IntegerField(verbose_name='执行人员', null=True)
	status = models.BooleanField(verbose_name='状态', default=True)
	created_time = models.DateTimeField(verbose_name='创建时间', auto_now_add=True)
	updated_time = models.DateTimeField(verbose_name='最后一次运行时间',null=True)

	def __unicode__(self):
		return self.case_name


	class Meta:
		verbose_name_plural = '测试用例'
		verbose_name = '测试用例'



