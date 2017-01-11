# -*- coding: utf-8 -*-

from fabric.api import *
from fabric.colors import *

env.roledefs = {
    'work': ['work@127.0.0.1', ],
    'root':['root@127.0.0.1', ],
}
env.passwords = {
    'root@127.0.0.1:22':'root',
    'work@127.0.0.1:22':'work',
}


@roles('work')
def host_type():
    run('uname -s')

@roles('root')
def sudo_root():
    run('cat /etc/passwd')

def do_local():
    local('pwd')
    local('ls -lrt')

def dotask():
    execute(host_type)
    print red('begin...', bold=True)
    execute(sudo_root)
    print blue('end...', bold=True)
    execute(do_local)
