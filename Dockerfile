FROM ubuntu:14.04

# Setup NodeSource Official PPA

RUN apt-get update && \
    apt-get install -y --force-yes \
      curl \
      apt-transport-https \
      lsb-release \
      build-essential \
      python-all 

RUN curl -sL https://deb.nodesource.com/setup | bash -
RUN apt-get update
RUN apt-get install nodejs -y --force-yes

RUN groupadd -r spotifyght && useradd -r -g spotifyght spotifyght

COPY . /app

WORKDIR /app

RUN npm install

EXPOSE 3001

ENV ENVIRONMENT prod

CMD ["/app/run.sh"]
