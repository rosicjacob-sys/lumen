#!/bin/sh
# Publish this project to GitHub Pages.
#
#   npm run deploy
#
# Builds the site with the correct Pages base path, regenerates the developer
# portal + source.zip from the CURRENT working tree, and force-pushes the built
# output to the `gh-pages` branch. The live site and the downloadable zip are
# produced by the same build, so they can never drift apart.
set -e

REPO=$(basename "$(git rev-parse --show-toplevel)")
OWNER=$(git remote get-url origin | sed -E 's#.*[/:]([^/]+)/[^/]+$#\1#')
ROOT=$(git rev-parse --show-toplevel)
cd "$ROOT"

echo "[deploy] $OWNER/$REPO -> gh-pages"
PAGES_BASE="/$REPO/" npm run build
npm run devportal
touch dist/.nojekyll

STAGE=$(mktemp -d)
cp -R dist/. "$STAGE"/
cd "$STAGE"
git init -q
git checkout -q -b gh-pages
git add -A
git -c user.name="deploy" -c user.email="deploy@local" commit -q -m "Publish $(date -u '+%Y-%m-%d %H:%M') UTC"
git push -q --force "https://github.com/$OWNER/$REPO.git" gh-pages
cd "$ROOT"
rm -rf "$STAGE"

echo "[deploy] live at https://$OWNER.github.io/$REPO/"
echo "[deploy] portal  https://$OWNER.github.io/$REPO/dev/"
