#!/bin/bash

# Simple shell script to compare the decaffeinated CoffeeScript 1.12.7 compiler
# with the official one, running it on all CoffeeScript files in the repo and
# making sure the output is the same. For now, it just fails on the first error.

set -e

rm -rf examples-tmp
mkdir examples-tmp
cd examples-tmp
git clone https://github.com/jashkenas/coffeescript.git --branch 1.12.7

for path in $(find coffeescript -name '*.coffee'); do
  echo "Comparing ${path}..."
  (./coffeescript/bin/coffee --compile --print ${path} || echo 'ERROR') > expected.js
  (../bin/coffee --compile --print ${path} || echo 'ERROR') > actual.js
  cmp expected.js actual.js
  echo 'Passed!'
done
