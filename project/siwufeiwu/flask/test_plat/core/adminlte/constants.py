# coding=utf-8

__author__ = 'lyhapple'

ITEMS_PER_PAGE = 5
DEFAULT_DASHBOARD_TITLE = u'首页'

MALE = 'male'
FEMALE = 'female'

SEX = (
    (MALE, u'男'),
    (FEMALE, u'女'),
)

TRUE_FALSE = (
    (True, u'是'),
    (False, u'否')
)

DICT_NULL_BLANK_TRUE = {
    'null': True,
    'blank': True
}

class HttpMothod(object):
    GET = 1
    POST = 2
    CHOICES = (
        (GET, u'GET'),
        (POST, u'POST'),
    )


class InterfaceLevel(object):
    HIGH = 3
    MIDDLE = 2
    LOW = 1
    CHOICES = (
        (HIGH, u'高'),
        (MIDDLE, u'中'),
        (LOW, u'初'),
    )

class TestcaseLevel(object):
    HIGH = 3
    MIDDLE = 2
    LOW = 1
    CHOICES = (
        (HIGH, u'高级'),
        (MIDDLE, u'中级'),
        (LOW, u'初级'),
    )

class TestcaseRes(object):
    PASS = 1
    FAIL = 0
    NOTRUN = 3
    CHOICES = (
        (PASS, u'成功'),
        (FAIL, u'失败'),
        (NOTRUN, u'未运行'),
    )

class ReadStatus(object):
    UNREAD = 0
    READ = 1
    DELETED = 99
    STATUS = (
        (UNREAD, u'未读'),
        (READ, u'已读'),
        (DELETED, u'删除'),
    )


class MailStatus(object):
    UNREAD = 0
    READ = 1
    DRAFT = 2
    TRASH = 3
    DELETED = 99
    STATUS = (
        (UNREAD, u'未读'),
        (READ, u'已读'),
        (DRAFT, u'草稿'),
        (TRASH, u'回收站'),
        (DELETED, u'删除'),
    )


class UsableStatus(object):
    UNUSABLE = 0
    USABLE = 1
    DELETED = 99
    STATUS = (
        (UNUSABLE, u'禁用'),
        (USABLE, u'启用'),
        (DELETED, u'删除'),
    )


class TaskStatus(object):
    NORMAL = 0
    EXCEPT = 1
    FINISHED = 2
    DELETED = 99
    TASK_STATUS = (
        (NORMAL, u'正常(进行中)'),
        (EXCEPT, u'异常'),
        (FINISHED, u'完成'),
        (DELETED, u'删除')
    )


class Position(object):
    STAFF = 0
    MANAGE = 1
    VICE_PRESIDENT = 2
    PRESIDENT = 3

    POSITIONS = (
        (STAFF, u'职工'),
        (MANAGE, u'经理'),
        (VICE_PRESIDENT, u'副总裁'),
        (PRESIDENT, u'总裁'),
    )

#　用例集中如果设置结束日期为无限制，则设置为EndSheduleTime
EndSheduleTime = '2020-01-01'