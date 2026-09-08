#!/usr/bin/env bash
#
# 保活脚本：定时 ping 后端健康检查接口，防止部署平台（Railway）空闲休眠 / 冷启动。
#
# 用法：
#   1) 前台跑（Ctrl+C 停止）：
#        ./scripts/keepalive.sh
#   2) 后台跑：
#        nohup ./scripts/keepalive.sh >> keepalive.log 2>&1 &
#   3) 只执行一次（配合系统 crontab / launchd 定时调用）：
#        ./scripts/keepalive.sh once
#
# 可通过环境变量覆盖：
#   HEALTH_URL        健康检查地址（默认 https://www.adlerian.com.cn/api/health）
#   INTERVAL_SECONDS  间隔秒数（默认 300 = 5 分钟）
#

set -u

HEALTH_URL="${HEALTH_URL:-https://www.adlerian.com.cn/api/health}"
INTERVAL_SECONDS="${INTERVAL_SECONDS:-300}"

ping_once() {
  local code
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "$HEALTH_URL" 2>/dev/null || echo "000")
  echo "[keepalive] $(date '+%F %T')  $HEALTH_URL  ->  HTTP $code"
  if [ "$code" != "200" ]; then
    return 1
  fi
  return 0
}

if [ "${1:-}" = "once" ]; then
  ping_once
  exit $?
fi

echo "[keepalive] 开始保活：$HEALTH_URL（每 ${INTERVAL_SECONDS}s 一次，Ctrl+C 停止）"
while true; do
  ping_once
  sleep "$INTERVAL_SECONDS"
done
