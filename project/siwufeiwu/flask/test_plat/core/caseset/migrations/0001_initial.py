# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Caseset',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created_time', models.DateTimeField(verbose_name=b'\xe5\x88\x9b\xe5\xbb\xba\xe6\x97\xb6\xe9\x97\xb4', auto_created=True)),
                ('set_name', models.CharField(unique=True, max_length=50, verbose_name=b'\xe7\x94\xa8\xe4\xbe\x8b\xe9\x9b\x86\xe5\x90\x8d\xe7\xa7\xb0')),
                ('set_desc', models.CharField(max_length=100, verbose_name=b'\xe7\x94\xa8\xe4\xbe\x8b\xe9\x9b\x86\xe6\x8f\x8f\xe8\xbf\xb0')),
                ('product_id', models.IntegerField(verbose_name=b'\xe4\xba\xa7\xe5\x93\x81id')),
                ('module_id', models.IntegerField(verbose_name=b'\xe6\xa8\xa1\xe5\x9d\x97id')),
                ('status', models.BooleanField(default=True, verbose_name=b'\xe7\x8a\xb6\xe6\x80\x81')),
                ('updated_time', models.DateTimeField(auto_now_add=True, verbose_name=b'\xe4\xbf\xae\xe6\x94\xb9\xe6\x97\xb6\xe9\x97\xb4')),
            ],
            options={
                'verbose_name': '\u5192\u70df\u7528\u4f8b\u96c6\u5408',
                'verbose_name_plural': '\u5192\u70df\u7528\u4f8b\u96c6\u5408',
            },
        ),
    ]
