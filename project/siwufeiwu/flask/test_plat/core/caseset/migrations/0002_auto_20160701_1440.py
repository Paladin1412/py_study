# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('caseset', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='caseset',
            name='created_time',
            field=models.DateTimeField(default=django.utils.timezone.now, verbose_name=b'\xe5\x88\x9b\xe5\xbb\xba\xe6\x97\xb6\xe9\x97\xb4', auto_created=True),
        ),
        migrations.AlterField(
            model_name='caseset',
            name='module_id',
            field=models.IntegerField(null=True, verbose_name=b'\xe6\xa8\xa1\xe5\x9d\x97id'),
        ),
    ]
