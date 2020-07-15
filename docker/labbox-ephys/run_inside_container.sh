#!/bin/bash

set -ex

if [ "$EUID" -ne 0 ]; then
  # not running as root
  sudo service nginx restart
else
  service nginx restart
fi


# yarn global add serve
# yarn global add concurrently
# pip install gunicorn

# export PATH=$(yarn global bin):~/.local/bin:$PATH

export KACHERY_STORAGE_DIR=/data/kachery-storage
mkdir -p $KACHERY_STORAGE_DIR

# TODO: set kachery-p2p environment variables here

# TODO: run the kachery-p2p daemon instead of the event stream server
# export EVENT_STREAM_SERVER_DIR=/data/eventstreamdata
# export PORT=$EVENT_STREAM_PORT
# mkdir -p $EVENT_STREAM_SERVER_DIR
# cp /hither/eventstreamserver/eventstreamserver_open.json $EVENT_STREAM_SERVER_DIR/eventstreamserver.json
# node --experimental-modules /hither/eventstreamserver/server/main.js &

cd /labbox-ephys
# concurrently "cd /labbox-ephys && serve -s build -l 15306" "cd /labbox-ephys/api && gunicorn -b 127.0.0.1:15307 api:app"

serve -s build -l 15306 &

# The following is just to make sure the user is not confused by the message of the serve command
set +x
echo -e "\e[31mPlease wait...\e[39m"
sleep 1
echo -e "\e[31mPlease wait...\e[39m"
sleep 1
echo -e "\e[31mPlease wait...\e[39m"
sleep 1
echo -e "\e[31mPlease wait...\e[39m"
sleep 1
echo -e "\e[32m-----------------------------------------------------\e[39m"
echo -e "\e[32mServing labbox-ephys on port 15310\e[39m"
echo -e "\e[32mPoint your browser to \e[1mhttp://localhost:15310\e[21m\e[39m"
echo -e "\e[32m-----------------------------------------------------\e[39m"


cd /labbox-ephys/python/api
set -x
exec gunicorn -b 127.0.0.1:15307 api:app