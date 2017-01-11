# coding=utf-8
from django.db import models

# Create your models here.
class Product(models.Model):
	product_name = models.CharField(verbose_name='产品名称', null=False, max_length=50,unique=True)
	status = models.BooleanField(verbose_name='产品状态', default=True)
	created_time = models.DateTimeField(verbose_name='创建时间', auto_now_add=True)
	updated_time = models.DateTimeField(verbose_name='修改时间', auto_now=True)
	def __unicode__(self):
		return self.product_name

	@property
	def countInterface(self):
		return self.interface_set.count()


	class Meta:
		verbose_name_plural = '产品'
		verbose_name = '产品'

class ModulesManager(models.Manager):
	def countTestcase(self):
		count = 0
		for a in self.interface_set.all():
			count = count +a.countTestcase
		return count

class Modules(models.Model):
	module_name = models.CharField(max_length=50, null=False, verbose_name='模块名称')
	product = models.ForeignKey(Product,verbose_name='产品id')
	module_detail=models.CharField(max_length=100,verbose_name="模块描述",null=True)
	status = models.BooleanField(verbose_name='状态', default=True)
	created_time = models.DateTimeField(verbose_name='创建时间', auto_now_add=True)
	updated_time = models.DateTimeField(verbose_name='修改时间', auto_now_add=True)
	objects = ModulesManager()

	@property
	def __unicode__(self):
		return self.module_name

	@property
	def countInterface(self):
		return self.interface_set.count()


	class Meta:
		verbose_name_plural = '模块'
		verbose_name = '模块'


