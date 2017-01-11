#!/usr/bin/env python
# -*- coding: utf-8 -*-
from __future__ import absolute_import, print_function, unicode_literals
from django import forms
from core.interface.models import Interface
from django.utils.translation import ugettext_lazy as _

__author__ = 'wangxiaoni'

class InterfaceForm(forms.Form):
    class Meta:
        model = Interface
        exclude = ('created_time','strong_field','status','default_param')


    def clean_name(self):
        try:
            name = Interface.objects.get(
                name__iexact=self.cleaned_data['name'])
        except Interface.DoesNotExist:
            return self.cleaned_data['name']
        # _("Account already exists.")
        raise forms.ValidationError("接口名称已经存在,请更换!")
