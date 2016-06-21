# Dobby
A bot engine platform to build conversational bots on top of Cisco Spark Message platform.

1. [Pre-Requisites](#pre_req)
1. [Installation and Deployment](#deployment)
1. [Setup](#setup)
 1. [Register Bot](#register_bot)
 1. [Invite Bot to a room](#invite_bot)
 1. [Pick a relay channel](#relay_channel)
 1. [Register a webhook](#register_webhook)
1. [Usage](#usage)

## <a name="pre_req"></a>Pre-requisites
Following are required for this application to be used:

1. node.js
 * download and install from [https://nodejs.org/en/]
 * required on the machine where this application would be deployed/run
1. Cassandra
 * download and install from [http://cassandra.apache.org/download/]
 * You can use a pre-existing cassandra node/cluster if already available, or download and install from above link for local laptop/lab-server

## <a name="deployment"></a>Installation and Deployment

1. clone the repo `git clone git@github.com:dobby-spark/dobby-core.git` on a machine where you want to run the application
2. setup environment variable *CONTACT_POINTS* to point to your cassandra host, e.g. `export CONTACT_POINTS=localhost`
3. (optional) setup environment variable *CONTACT_PORT* to point to your cassandra port, e.g. `export CONTACT_PORT=9042`
4. run setup `cd dobby-core; ./setup.sh`

## <a name="setup"></a>Setup

### <a name="register_bot"></a>1. Register Bot
It is advisable that you use a new/unique account for your bot, that it can be easily invited to different rooms for participation.
1. register a new/unique Cisco Spark account
2. log on [developer.ciscospark.com] to obtain token for your bot's account
 
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

1. start the bot engine `node dobby.js <channel-name> <spark-token>` : here `<channel-name>` is the name of the channel [you picked](#relay_channel) above, and `<spark-token>` is the access token you obtained in [register bot](#register_bot) step above.
2. start training your bot as mentioned in example below.
