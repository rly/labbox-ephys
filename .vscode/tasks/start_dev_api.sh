#!/bin/bash

set -ex

# TODO: set kachery-p2p environment variables here

cd python/api
python -m flask run -p 15352 --no-debugger