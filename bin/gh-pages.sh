#!/bin/bash

git checkout gh-pages
git reset --hard master
npm prune
npm install
git add -f node_modules/
git commit -m "chore(gh-pages): force-add node_modules"
git push -f origin HEAD:gh-pages
git checkout master

