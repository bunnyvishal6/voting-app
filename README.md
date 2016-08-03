#Voting App
** This is a voting app, a MEAN stack project done for Free Code Camp backend project. **
* [Here is the url: ](https://bunny-voting-app.herokuapp.com)

### User stories of this web app:

* Users can sign up with facebook account or google account or with an email.
* Registered can make upto five polls and each poll can have upto 10 options.
* After creating a poll you can share the url of your poll with your friends
* The polls will be stored and can come back later to access them.
* After reaching the limit if you wan to create a new poll , you should delete any one of your old polls.
* Only registered users can vote one time to a poll.
* Any one who has the poll url can view the poll and its stats.
* We use charts.js to visualize the data of poll.


### To Deploy this app,  you need to change the following:

* Update with facebook and google app-id and app-secret and also the callback urls with your domain in 'config/auth.js'
* Change mongoose connection in 'server.js' to real working url.
* Change the url part in the 'custom.js' to your domain.

