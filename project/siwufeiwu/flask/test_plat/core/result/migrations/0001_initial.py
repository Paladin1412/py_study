# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('interface', '0003_auto_20160727_1603'),
        ('caseset', '0002_auto_20160727_1454'),
        ('product', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Res',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('res_status', models.PositiveSmallIntegerField(default=3, verbose_name='\u6267\u884c\u7ed3\u679c', choices=[(1, '\u6210\u529f'), (0, '\u5931\u8d25'), (3, '\u672a\u8fd0\u884c')])),
                ('response', models.CharField(max_length=255, verbose_name=b'\xe8\xbf\x94\xe5\x9b\x9e\xe6\x8a\xa5\xe6\x96\x87')),
                ('created_time', models.DateTimeField(auto_now_add=True, verbose_name=b'\xe5\x88\x9b\xe5\xbb\xba\xe6\x97\xb6\xe9\x97\xb4')),
                ('elapsed_time', models.CharField(default=None, max_length=15, verbose_name=b'\xe6\xb6\x88\xe8\x80\x97\xe6\x97\xb6\xe9\x97\xb4')),
                ('case', models.ForeignKey(verbose_name=b'\xe7\x94\xa8\xe4\xbe\x8bid', to='interface.Testcase')),
                ('caseset', models.ForeignKey(default=None, blank=True, to='caseset.Caseset', null=True, verbose_name=b'\xe7\x94\xa8\xe4\xbe\x8b\xe9\x9b\x86id')),
                ('module', models.ForeignKey(default=None, blank=True, to='product.Modules', null=True, verbose_name=b'\xe6\xa8\xa1\xe5\x9d\x97id')),
                ('product', models.ForeignKey(verbose_name=b'\xe4\xba\xa7\xe5\x93\x81id', to='product.Product')),
            ],
            options={
                'verbose_name': '\u6267\u884c\u7ed3\u679c',
                'verbose_name_plural': '\u6267\u884c\u7ed3\u679c',
            },
        ),
    ]
