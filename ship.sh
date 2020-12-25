clear
echo "Compiling TypeScript..."
tsc
echo "Obfuscating JavaScript..." 
rm -rf dist/node_modules
javascript-obfuscator dist --output dist --config obfucation.json > /dev/null 2>&1
cd dist
echo "Installing Dependencies..."
yarn install > /dev/null 2>&1
echo "Building zip..."
zip -r ../dist.zip ./ > /dev/null 2>&1
echo "Removing Src & Dependencies..."
rm -rf src node_modules
clear