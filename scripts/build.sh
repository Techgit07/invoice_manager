# If the directory, `dist`, doesn't exist, create `dist`
stat build || mkdir build
# Archive artifacts
# cd build
zip build/tap-digital-backend.zip -r build package.json config .platform .env .npmrc
