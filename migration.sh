#!/bin/bash

SLACK_WEBHOOK_URL="https://hooks.slack.com/services/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"

send_slack_notification() {
  local message=$1
  curl -X POST -H 'Content-type: application/json' --data "{
    \"text\": \"${message}\"
  }" $SLACK_WEBHOOK_URL
}

notify_syntax() {
  echo "transaction과 try-catch 문을 사용하여 마이그레이션을 실행하세요."
  echo "예시:
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('tbl_user_detail', 'fakeCol', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      throw error;
    }
  },
  "
}

run_migration() {
  local env=$1
  echo "migration in progress..."

  npx sequelize db:migrate --env "$env"
  local status=$?

  if [ $status -eq 0 ]; then
    SLACK_MESSAGE="마이그레이션 완료\n일자: $(date).\n환경: $env"
    send_slack_notification "$SLACK_MESSAGE"
    echo "마이그레이션이 성공적으로 완료되었습니다."
    exit 0
  else
    SLACK_MESSAGE="마이그레이션 실패\n일자: $(date).\n환경: $env"
    send_slack_notification "$SLACK_MESSAGE"
    echo "마이그레이션 중 오류가 발생했습니다."
    exit 1
  fi
}

if [ -z "$1" ]; then
  echo "잘못된 명령어입니다."
  exit 1

elif [ "$1" == "env" ]; then
  if [ -z "$2" ]; then
    echo "마이그레이션을 실행할 환경을 입력하세요."
    exit 1
  fi

  if [ "$2" == "staging" ] || [ "$2" == "production" ]; then
    run_migration "$2"

  else
    echo "알 수 없는 환경입니다: $2"
    exit 1
  fi

else
  echo "creating migration $1..."
  npx sequelize migration:create --name "$1"
  notify_syntax
  SLACK_MESSAGE="마이그레이션 파일 생성: $1"
  send_slack_notification "$SLACK_MESSAGE"
  exit 0
fi
