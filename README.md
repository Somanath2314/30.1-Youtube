# Basics steps that are done building this, basically the set up process

1. `npm init`
2. `git init`
3. `npm i -D env` //basically installed in the devDependency which we wont push into production
4. `mkdir public`
5. `touch .env .env.example`
6. `$ npm i -D prettier`
7. `npm i -D nodemon`
8. In package.json change the start to dev, i.e when typed `npm run dev`
   and write `nodemon src/index.js`
