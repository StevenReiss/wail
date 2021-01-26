#! /bin/csh -f

rm -rf bBACKUP

tree -H '.' -d -L 1 --noreport --charset utf-8 >&! index.html

