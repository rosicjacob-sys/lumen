#!/bin/sh
# Publish this project to Vercel:  npm run deploy
# Rebuilds the site AND regenerates dist/dev (portal + source.zip) from the
# current working tree, so the download always matches the live page.
set -e
NAME="$1"
[ -z "$NAME" ] && { echo "usage: sh scripts/deploy-vercel.sh <vercel-project-name>"; exit 1; }
cd "$(git rev-parse --show-toplevel)"
PAGES_BASE=/ npm run build
npm run devportal
rm -rf dist/.vercel
vercel deploy --prod --yes --name "$NAME" dist
