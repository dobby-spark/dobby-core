# Dobby (Version 0.1)
A bot engine platform to build conversational bots on top of Cisco Spark Message platform.

1. [What's New](#whats_new)
1. [Pre-Requisites](#pre_req)
1. [Installation and Deployment](#deployment)
1. [Setup](#setup)
 1. [Register Bot](#register_bot)
 1. [Invite Bot to a room](#invite_bot)
 1. [Pick a relay channel](#relay_channel)
 1. [Register a webhook](#register_webhook)
1. [Usage](#usage)
 1. [Invocation](#invocation)
 1. [Conversation](#conversation)
 1. [Training](#training)

## <a name="whats_new"></a>What's New
This is the initial release of Dobby -- a conversation bot building platform on top of Cisco Spark. Current implementation has a proof of concept for a bot training model using `Gradient Scale` method as described here (TBD). Our goal for this conversation bot platform is that one can start with intial deployment mentioned here, and then any conversation training for the bot should be using conversation methods only, and should not require writing any code.

## <a name="pre_req"></a>Pre-requisites
Following are required for this application to be used:

1. node.js
 * download and install from [https://nodejs.org/en/]
 * required on the machine where this application would be deployed/run
1. Cassandra
 * download and install from [http://cassandra.apache.org/download/]
 * You can use a pre-existing cassandra node/cluster if already available, or download and install from above link for local laptop/lab-server

## <a name="deployment"></a>Installation and Deployment
To use this application, you'll need to install and deploy the bot engine platform on either a laptop or lab machine with node.js installed, and access to cassandra server either locally or on the network.

1. clone the repo `git clone git@github.com:dobby-spark/dobby-core.git` on a machine where you want to run the application
1. install node.js dependencies: `cd dobby-core; npm install`
1. setup environment variable *CONTACT_POINTS* to point to your cassandra host, e.g. `export CONTACT_POINTS=localhost`
1. (optional) setup environment variable *CONTACT_PORT* to point to your cassandra port, e.g. `export CONTACT_PORT=9042`
1. create and populate cassandra DB by runnin setup: `./setup.sh`

## <a name="setup"></a>Setup

### <a name="register_bot"></a>1. Register Bot
It is advisable that you use a new/unique account for your bot, that it can be easily invited to different rooms for participation.
1. register a new/unique Cisco Spark account
1. log on [developer.ciscospark.com] to obtain token for your bot's account
 
### <a name="invite_bot"></a>2. Invite Bot to a room
Create a new Spark conversation using your own spark account and invite the bot's account to that room.

### <a name="relay_channel"></a>3. Pick a relay channel
This application works with a (very simple) spark relay service, that acts as buffer queue for bots deployed in the corporate network. This service was implemented because bots inside corporate network cannot be reached by the spark webhook notifications. To work with this relay service, you need to pick a unique channel name. Suggest using a unique channel name (e.g. a random string) to avoid collisons.

### <a name="register_webhook"></a>4. Register a webhook
Use the Cisco Spark Developer portal to register a webhook for your bot's channel as following:
* register a webhook target URL `https://spark-relay.appspot.com/v1/spark/<channel-name>` for the room you've invite your bot into
* send a message to the room after above webhook has been registered
* perform an HTTP get from URL `https://spark-relay.appspot.com/v1/poll/<channel-name>` to verify that spark notification is recieved 

> in above steps, `<channel-name>` is the name of the channel [you picked](#relay_channel) above.

## <a name="setup"></a>Usage

### <a name="invocation"></a>Invocation
Start the bot engine platform on your laptop or server, where you [deployed as above](#deployment).
1. (optional) export any proxy settings if applicable: `export HTTP_PROXY=<your corporate proxy server>`
1. start the bot engine `node dobby.js <channel-name> <spark-token>` : here `<channel-name>` is the name of the channel [you picked](#relay_channel) above, and `<spark-token>` is the access token you obtained in [register bot](#register_bot) step above.

You should expect to see a message from your bot like below:
```
$ node dobby.js <channel-name> <access-token>
my identity:  { name: 'Mr. Dobby Spark',
  id: 'Y2lzY29zcGFyazovL3VzL1BFT1BMRS8zODY0Y2ZhMS02YzkzLTQ1YjktOTU1OS1mN2NkODZmMWQ1ZTE',
  email: 'dobby.spark@gmail.com' }
Chatbot: Mr. Dobby Spark listening on channel: <channel-name>
```

> if you want to keep bot running on a lab server for continous use, you may want to use: `nohup node dobby.js <channel> <token> &`

### <a name="conversation"></a>Conversation
You'll converse with your bot started above using spark client, by sending a message to your bot from the room where bot was [added as above](#invite_bot).

### <a name="training"></a>Training
Initial setup creates a bot with no training data, and you'll need to train your bot for conversation. Below example has a simple training transcript. For more details refer to wiki (TBD).
```
You 10:00 PM
hi

Mr. Dobby Spark(@gmail.com) 10:00 PM
please configure your bot using #dobby commands

You 10:00 PM
#dobby #help #logic #when

Mr. Dobby Spark(@gmail.com) 10:00 PM
syntax: '#dobby #logic #when [ topic is <topic> and] [intent is <intent>] [and state is <state>] [and input is <input>] then [transition to [intent][/<state>] and] [say <phrase>]'

You 10:00 PM
#dobby #logic #when input is hi then say hello!

Mr. Dobby Spark(@gmail.com) 10:00 PM
dobby added new key hi for type input
created: {"topic":"1","intent":"1","state":"1","input":"hi"} ==> {"say":"hello!"}

You 10:00 PM
hi

Mr. Dobby Spark(@gmail.com) 10:00 PM
hello!
```
