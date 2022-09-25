# Lumine

A markdown extension for dairy, planning and todo based on remark without introducing new syntax/keyword to allow most markdown preview software can handle it correctly.

## Todo

Transforming planning of previous day to today's todo by
`node src/main.js -- journal <markdown path> <target date in YYYY-MM-DD>`

## Ledger

Generate previous day's ledger
`node src/main.js -- ledger <markdown path>`

And load ledger by
`cat $(ls ~/Ledger/*) | hledger bs -f -`

Setting up a cron task to allow auto generation.

Look at the examples folder for more information about format.

<del>May rewrite it in rust/racket someday</del>
