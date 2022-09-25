#!/usr/bin/sh

cd "${0%/*}"

node src/main.js -- "$1/$(date -d 'yesterday' '+%Y-%m-%d').md" $(date '+%Y-%m-%d') > "$1/$(date '+%Y-%m-%d').md"
