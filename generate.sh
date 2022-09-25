#!/usr/bin/sh

cd "${0%/*}" > /dev/null 2>&1

today=$(date '+%Y-%m-%d')
yesterday=$(date -d 'yesterday' '+%Y-%m-%d')
journal_path="$1/Daily/$yesterday.md"
# generate new journal
node src/main.js -- journal $journal_path $today > "$1/Daily/$today.md"

# generate yesterday ledger
node src/main.js -- ledger $journal_path > "$1/Ledger/$yesterday.hledger"

