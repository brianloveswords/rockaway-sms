server: 
	node_modules/.bin/up -t 0 -n 1 -w -p 3000 app.js

test:
	node_modules/.bin/tap tests/*test*.js

heroku:
	git push heroku master