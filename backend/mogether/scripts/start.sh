#!/usr/bin/env bash

REPOSITORY=/home/ubuntu/app
JAR_NAME=$(ls -tr $REPOSITORY/*SNAPSHOT.jar | tail -n 1)

echo "> 현재 구동 중인 애플리케이션 pid 확인"

# CURRENT_PID=$(pgrep -fla java | grep hayan | awk '{print $1}' | pgrep -f $JAR_NAME)
CURRENT_PID=$(pgrep -f $JAR_NAME)

echo "현재 구동 중인 애플리케이션 pid: $CURRENT_PID" >> /home/ubuntu/app/deploy.log

if [ -z "$CURRENT_PID" ]; then
  echo "현재 구동 중인 애플리케이션이 없으므로 종료하지 않습니다." >> /home/ubuntu/app/deploy.log
else
  echo "> kill -15 $CURRENT_PID"
  kill -15 $CURRENT_PID
  sleep 5
fi

echo "> 새 애플리케이션 배포" >> /home/ubuntu/app/deploy.log

JAR_NAME=$(ls -tr $REPOSITORY/*SNAPSHOT.jar | tail -n 1)

echo "> JAR NAME: $JAR_NAME"

echo "> $JAR_NAME 에 실행권한 추가" >> /home/ubuntu/app/deploy.log

chmod +x $JAR_NAME

echo "> $JAR_NAME 실행" >> /home/ubuntu/app/deploy.log

# nohup java -jar -Duser.timezone=Asia/Seoul $JAR_NAME >> $REPOSITORY/nohup.out 2>&1 &
# nohup java -jar -Dspring.profiles.active=prod $JAR_NAME >> $REPOSITORY/nohup.out 2>&1 &
nohup java -Duser.timezone=Asia/Seoul -jar -Dspring.profiles.active=prod $JAR_NAME >> $REPOSITORY/nohup.out 2>&1 &

#!/bin/bash

# ROOT_PATH="/home/ubuntu/app"
# JAR="$ROOT_PATH/application.jar"
# STOP_LOG="$ROOT_PATH/stop.log"
# SERVICE_PID=$(pgrep -f $JAR) # 실행중인 Spring 서버의 PID

# if [ -z "$SERVICE_PID" ]; then
#   echo "Running Application NotFound" >> $STOP_LOG
# else
#   echo "Stop Application" >> $STOP_LOG
#   kill "$SERVICE_PID"
#   # kill -9 $SERVICE_PID # 강제 종료를 하고 싶다면 이 명령어 사용
# fi


# APP_LOG="$ROOT_PATH/application.log"
# ERROR_LOG="$ROOT_PATH/error.log"
# START_LOG="$ROOT_PATH/start.log"

# NOW=$(date +%c)

# echo "[$NOW] $JAR 복사" >> $START_LOG
# cp $ROOT_PATH/build/libs/moim-0.0.1-SNAPSHOT.jar $JAR

# echo "[$NOW] > $JAR 실행" >> $START_LOG
# nohup java -jar $JAR > $APP_LOG 2> $ERROR_LOG &

# echo "[$NOW] > 서비스 PID: $SERVICE_PID" >> $START_LOG
