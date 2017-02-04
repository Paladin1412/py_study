#!/bin/bash

function log()
{
    local level=$1
    local msg=$2
    local time_prefix=$( date "+%Y/%m/%d %H:%M:%S" )
    #echo "${time_prefix}  ${level} |   ${msg}"
    printf "\e[32m%s %s  |\e[00m  %s\n" "${time_prefix}" "${level}" "${msg}"
}

function remote_cmd() 
{   
    local cmd=$1
    local cmd_prefix='sshpass -p QcWQNwzJuKx0Lga85RFNBQmuwT0= ssh  -o StrictHostKeychecking=no work@172.16.5.24'
    eval ${cmd_prefix} ${cmd}
}

function progress_bar()
{
    START=1
    END=100
    TOL=$[END - START + 1]
    A_SP=50

    echo "Testing..."
    for i in `seq $START $END`
    do
        PER=$( echo "($i-$START+1/$TOL*100)" | bc -l )
        N_SP=$( echo "$PER*$A_SP/100" | bc )
        printf "\rnode:%-${#END}d:\e[43m%${N_SP}s\e[00m%$[A_SP-N_SP]s%.1f%%" $i "" "" $PER
        sleep 0.1
    done > /tmp/pro.log &
    START_TIME=`date +%s`
    while [[ -n `ps -A | grep $!` ]]
    do
        TIME_ELAPSE=$[`date +%s` - START_TIME]
        cat /tmp/pro.log
        echo -n "   Time elasped:$TIME_ELAPSE s"
    done
    rm /tmp/pro.log
    echo 
}

function progress_bar1()
{
    local CHAR=''
    local i=0
    for (( i=0; $i<=100; i+=2 ))
    do
        printf "\rprogress:[%-50s] %d%%" $CHAR $i
        sleep 0.1
        CHAR='#'$CHAR
    done
    echo 
}

function progress_bar2()
{
    local i=0
    local j=''
    while [[ $i -lt 20 ]]
    do
        for j in '-' '\' '|' '/'
        do
            printf "\rprogress: %s" $j
            sleep 0.1
            ((i++))
        done
    done
    echo 
}

function scp_log()
{
    local host=$1
    local user=$2
    local passwd=$3
    local log_path=$4
    local save_path=$5
    log INFO "Begin scp ${log_path} to ${save_path}"
    sshpass -p ${passwd} scp -r ${user}@${host}:${log_path} ${save_path} &
    [[ $? -ne 0 ]] && log ERROR "Scp ${log_path} [Fail]" && return 255
    local char=''
    local cost=0
    while [[ `jobs -l | grep 'Running' | grep $! 2>&1 > /dev/null && echo $?` ]]
    do
        printf "\rProgress: [%-80s] time cost:%ds" ${char} ${cost}
        sleep 3
        char='#'${char}
        cost=$[cost + 3]
    done 
    wait 
    printf "\r\n"
    log INFO "Finish scp ${log_path} to ${save_path}"
}


#progress_bar2
#progress_bar1
#progress_bar

#变量初始化
clear
ONLINE_HOST_1='172.16.5.25'
ONLINE_PASS_1='QcWQNwzJuKx0Lga85RFNBQmuwT0='
ONLINE_NAME_1='work'
LOG_DIR='/home/work/var/log/folio'
WORK_DIR="$HOME/.private/zhangjiwei/online_log"
if [ ! -d  ${WORK_DIR} ]; then
    mkdir -p ${WORK_DIR}
fi
#rm ${WORK_DIR}/*log*

remote_cmd "ls /home/work/var/log/folio" > folio_log_list.txt
INFO_LOG_LIST=`cat folio_log_list.txt | grep 'folio-info.log'`
STAT_LOG_LIST=`cat folio_log_list.txt | grep 'folio-stat.log'`
/bin/rm -rf folio_log_list.txt

#scp线上日志
for i in ${INFO_LOG_LIST}
do
    scp_log ${ONLINE_HOST_1} ${ONLINE_NAME_1} ${ONLINE_PASS_1} ${LOG_DIR}/$i ${WORK_DIR}
done

for i in ${STAT_LOG_LIST}
do
    scp_log ${ONLINE_HOST_1} ${ONLINE_NAME_1} ${ONLINE_PASS_1} ${LOG_DIR}/$i ${WORK_DIR}
done

#日志过滤与拼接
#cd ${WORK_DIR}
#log INFO "CD workdir: `pwd`"
#/bin/rm -rf *.k_v  one.log*
#
#for i in `ls folio-stat.log*`
#do
#    log_postfix=`echo $i | awk -F'log' '{print $2}'`
#    cat $i | grep '/folio/newhouse/' | grep -o 'trace_.*json' | awk -F'/folio' '{print $1"]"$2}' | awk -F']' '{print $1"\t\tfolio"$3}' > $i.k_v
#    [[ $? -ne 0 ]] && log INFO "filter k_v for $i [Failed]"
#    log INFO "filter k_v for $i [OK]"
#    /bin/rm -rf one.log${log_postfix}
#    total_num=$( cat $i.k_v | wc -l )
#    read_num=0
#    while read line
#    do
#        leave_num=$[total_num-read_num]
#        id=`echo ${line} | awk '{print $1}'`
#        uri=`echo ${line} | awk '{print $2}'`
#        log INFO "id=${id}  uri=${uri}"
#        log INFO "[Sum:$total_num][Read:$read_num][Leave:$leave_num]"
#        info=$( cat folio-info.log${log_postfix} | grep ${id} )
#        if [[ ${info} ]]; then
#            param=$( echo ${info} | awk -F'请求参数:' '{print $2}' )
#            log INFO "param=${param}"
#            echo "${uri}    ${param} " >> one.log${log_postfix} 
#        else
#            log INFO "param=None"
#            echo "${uri}" >> one.log${log_postfix} 
#        fi
#        read_num=$[read_num+1]
#    done < $i.k_v
#done
#
#log INFO "All one log process finished"
#
