# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('product', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Interface',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created_time', models.DateTimeField(default=django.utils.timezone.now, verbose_name=b'\xe5\x88\x9b\xe5\xbb\xba\xe6\x97\xb6\xe9\x97\xb4', auto_created=True)),
                ('name', models.CharField(max_length=80, verbose_name=b'\xe6\x8e\xa5\xe5\x8f\xa3\xe5\x90\x8d\xe7\xa7\xb0')),
                ('req_url', models.CharField(max_length=100, verbose_name=b'\xe8\xaf\xb7\xe6\xb1\x82url')),
                ('reqmethod', models.PositiveSmallIntegerField(default=1, verbose_name='\u8bf7\u6c42\u65b9\u5f0f', choices=[(1, 'GET'), (2, 'POST')])),
                ('detail', models.CharField(max_length=100, verbose_name=b'\xe6\x8e\xa5\xe5\x8f\xa3\xe6\x8f\x8f\xe8\xbf\xb0')),
                ('strong_field', models.CharField(max_length=200, null=True, verbose_name=b'\xe6\xa0\xa1\xe9\xaa\x8c\xe5\x81\xa5\xe5\xa3\xae\xe6\x80\xa7\xe5\xad\x97\xe6\xae\xb5')),
                ('default_param', models.CharField(max_length=255, verbose_name=b'\xe9\xbb\x98\xe8\xae\xa4\xe5\x8f\x82\xe6\x95\xb0')),
                ('is_json', models.BooleanField(default=False, verbose_name=b'\xe5\x85\xa5\xe5\x8f\x82\xe6\x98\xaf\xe5\x90\xa6json')),
                ('level', models.PositiveSmallIntegerField(default=1, verbose_name='\u63a5\u53e3\u4f18\u5148\u7ea7', choices=[(3, '\u9ad8'), (2, '\u4e2d'), (1, '\u521d')])),
                ('developer', models.IntegerField(default=None, verbose_name=b'\xe5\xbc\x80\xe5\x8f\x91\xe4\xba\xba\xe5\x91\x98\xe7\x94\xa8\xe6\x88\xb7id')),
                ('status', models.BooleanField(default=True, verbose_name=b'\xe6\x8e\xa5\xe5\x8f\xa3\xe7\x8a\xb6\xe6\x80\x81')),
                ('updated_time', models.DateTimeField(auto_now_add=True, verbose_name=b'\xe4\xbf\xae\xe6\x94\xb9\xe6\x97\xb6\xe9\x97\xb4')),
                ('module', models.ForeignKey(verbose_name=b'\xe6\xa8\xa1\xe5\x9d\x97id', to='product.Modules')),
                ('product', models.ForeignKey(verbose_name=b'\xe4\xba\xa7\xe5\x93\x81id', to='product.Product')),
            ],
            options={
                'verbose_name': '\u63a5\u53e3',
                'verbose_name_plural': '\u63a5\u53e3',
            },
        ),
        migrations.CreateModel(
            name='Res',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created_time', models.DateTimeField(verbose_name=b'\xe5\x88\x9b\xe5\xbb\xba\xe6\x97\xb6\xe9\x97\xb4', auto_created=True)),
                ('case_id', models.IntegerField(verbose_name=b'\xe7\x94\xa8\xe4\xbe\x8bid')),
                ('res_status', models.CharField(max_length=5, verbose_name=b'\xe6\x89\xa7\xe8\xa1\x8c\xe7\xbb\x93\xe6\x9e\x9c')),
                ('response', models.CharField(max_length=255, verbose_name=b'\xe8\xbf\x94\xe5\x9b\x9e\xe6\x8a\xa5\xe6\x96\x87')),
                ('is_smoke', models.BooleanField(default=False, verbose_name=b'\xe6\x98\xaf\xe5\x90\xa6\xe5\x86\x92\xe7\x83\x9f\xe7\x94\xa8\xe4\xbe\x8b')),
                ('product_id', models.IntegerField(verbose_name=b'\xe4\xba\xa7\xe5\x93\x81id')),
                ('module_id', models.IntegerField(verbose_name=b'\xe6\xa8\xa1\xe5\x9d\x97id')),
                ('case_set_id', models.IntegerField(null=True, verbose_name=b'\xe7\x94\xa8\xe4\xbe\x8b\xe9\x9b\x86\xe5\x90\x88id')),
                ('updated_time', models.DateTimeField(auto_now_add=True, verbose_name=b'\xe4\xbf\xae\xe6\x94\xb9\xe6\x97\xb6\xe9\x97\xb4')),
            ],
            options={
                'verbose_name': '\u6267\u884c\u7ed3\u679c',
                'verbose_name_plural': '\u6267\u884c\u7ed3\u679c',
            },
        ),
        migrations.CreateModel(
            name='Testcase',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created_time', models.DateTimeField(default=django.utils.timezone.now, verbose_name=b'\xe5\x88\x9b\xe5\xbb\xba\xe6\x97\xb6\xe9\x97\xb4', auto_created=True)),
                ('modify_param', models.CharField(max_length=200, null=True, verbose_name=b'\xe5\x8f\x98\xe5\x8c\x96\xe7\x9a\x84\xe5\x8f\x82\xe6\x95\xb0')),
                ('case_name', models.CharField(max_length=100, verbose_name=b'\xe7\x94\xa8\xe4\xbe\x8b\xe6\xa0\x87\xe9\xa2\x98')),
                ('case_detail', models.CharField(max_length=100, verbose_name=b'\xe7\x94\xa8\xe4\xbe\x8b\xe6\x8f\x8f\xe8\xbf\xb0')),
                ('code_check', models.IntegerField(null=True, verbose_name=b'\xe7\x8a\xb6\xe6\x80\x81\xe7\xa0\x81\xe6\xa3\x80\xe6\x9f\xa5')),
                ('res_check', models.CharField(max_length=200, null=True, verbose_name=b'\xe8\xbf\x94\xe5\x9b\x9e\xe5\x80\xbc\xe6\xa0\xa1\xe9\xaa\x8c')),
                ('res_id', models.IntegerField(null=True, verbose_name=b'\xe7\xbb\x93\xe6\x9e\x9cid')),
                ('caseresult', models.PositiveSmallIntegerField(default=3, verbose_name='\u6267\u884c\u7ed3\u679c', choices=[(1, '\u6210\u529f'), (0, '\u5931\u8d25'), (3, '\u672a\u8fd0\u884c')])),
                ('created_by', models.IntegerField(verbose_name=b'\xe5\x88\x9b\xe5\xbb\xba\xe8\x80\x85')),
                ('is_smoke', models.BooleanField(default=False, verbose_name=b'\xe6\x98\xaf\xe5\x90\xa6\xe5\x86\x92\xe7\x83\x9f\xe6\xb5\x8b\xe8\xaf\x95')),
                ('count', models.IntegerField(null=True, verbose_name=b'\xe6\x89\xa7\xe8\xa1\x8c\xe6\xac\xa1\xe6\x95\xb0')),
                ('pass_count', models.IntegerField(default=0, null=True, verbose_name=b'\xe9\x80\x9a\xe8\xbf\x87\xe6\xac\xa1\xe6\x95\xb0')),
                ('fail_count', models.IntegerField(default=0, null=True, verbose_name=b'\xe5\xa4\xb1\xe8\xb4\xa5\xe6\xac\xa1\xe6\x95\xb0')),
                ('level', models.PositiveSmallIntegerField(default=1, verbose_name='\u7528\u4f8b\u4f18\u5148\u7ea7', choices=[(3, '\u9ad8\u7ea7'), (2, '\u4e2d\u7ea7'), (1, '\u521d\u7ea7')])),
                ('init_sql', models.CharField(max_length=100, null=True, verbose_name=b'\xe5\x88\x9d\xe5\xa7\x8b\xe5\x8c\x96\xe6\x95\xb0\xe6\x8d\xaesql')),
                ('delete_sql', models.CharField(max_length=100, null=True, verbose_name=b'\xe6\xb8\x85\xe9\x99\xa4\xe6\x95\xb0\xe6\x8d\xaesql')),
                ('zento_bug_id', models.CharField(max_length=10, null=True, verbose_name=b'\xe7\xa6\x85\xe9\x81\x93\xe7\xbc\x96\xe5\x8f\xb7')),
                ('case_setlist', models.CharField(max_length=200, null=True, verbose_name=b'\xe6\x89\x80\xe5\xb1\x9e\xe7\x94\xa8\xe4\xbe\x8b\xe9\x9b\x86\xe5\x90\x88')),
                ('tester', models.IntegerField(null=True, verbose_name=b'\xe6\x89\xa7\xe8\xa1\x8c\xe4\xba\xba\xe5\x91\x98')),
                ('status', models.BooleanField(default=True, verbose_name=b'\xe7\x8a\xb6\xe6\x80\x81')),
                ('updated_time', models.DateTimeField(auto_now_add=True, verbose_name=b'\xe4\xbf\xae\xe6\x94\xb9\xe6\x97\xb6\xe9\x97\xb4')),
                ('interface', models.ForeignKey(verbose_name=b'\xe6\x8e\xa5\xe5\x8f\xa3id', to='interface.Interface')),
            ],
            options={
                'verbose_name': '\u6d4b\u8bd5\u7528\u4f8b',
                'verbose_name_plural': '\u6d4b\u8bd5\u7528\u4f8b',
            },
        ),
    ]
