FROM node:20-bullseye-slim AS build

#RUN sed -i 's|deb.debian.org|ftp.kr.debian.org|g' /etc/apt/sources.list
#RUN sed -i 's|security.debian.org|ftp.kr.debian.org|g' /etc/apt/sources.list

RUN mkdir -p /src
RUN mkdir -p /opt/log
RUN mkdir -p /data

WORKDIR /src

COPY package.json /src
COPY yarn.lock /src

RUN apt clean
RUN apt update && apt install -y net-tools python3 build-essential && apt install -y procps
RUN apt install -y wget
RUN apt install -y gnupg

# Set default host OS to Linux.
ARG HOST_OS=linux

# Set the Chrome repo.
RUN if [ "$HOST_OS" != "darwin" ]; then \
    wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list; \
fi

# Install Chrome.
RUN if [ "$HOST_OS" != "darwin" ]; then \
    apt update && apt install -y --no-install-recommends \
    google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*; \
fi

# RUN apt install -y libglib2.0-0 && apt install -y libnss3 && libatk-bridge2.0-0
# RUN apt update && \
#     apt install -y libglib2.0-0 libatk1.0-0 libnss3 libatk-bridge2.0-0
# which: 설치 되어 있다면 path를 출력
# process code = 0(성공) 1(실패)
# which yarn -> echo $? 로 확인 가능
# 설치되어 있지 않다면 install
RUN which yarn || npm install -g yarn
RUN yarn global add pm2
RUN pm2 install pm2-logrotate
# yarn.lock에 있는 dependency 설치
RUN yarn install --frozen-lockfile
# RUN yarn add puppeteer

COPY . /src
# CMD ["google-chrome-stable", "--no-sandbox"]

ADD docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
ENTRYPOINT ["/bin/bash", "/docker-entrypoint.sh"]

EXPOSE 10002
