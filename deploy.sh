echo
echo '\t---------------------------------------'
echo '\t\tDeleting old build folder'
echo '\t----------------------------------------'
echo
echo $ rm -rf ./build
echo
rm -rf ./build

echo '\t----------------------------------------'
echo '\t\tRebuilding React project'
echo '\t----------------------------------------'
echo
yarn build

echo
echo '\t----------------------------------------'
echo '\t\tDeploying static assets'
echo '\t----------------------------------------'
surge ./build redditbrowser.surge.sh