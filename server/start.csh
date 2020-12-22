#! /bin/csh -f

pm2 stop wail

pm2 start run.sh -l server.log --name wail
