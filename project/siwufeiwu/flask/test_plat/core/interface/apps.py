# coding=utf-8

from django.apps import AppConfig

__author__ = 'wangxiaoni'


class InterfaceAppConfig(AppConfig):
    name = "core.interface"
    verbose_name = u"接口管理"

    def ready(self):
        import serializers
        pass


