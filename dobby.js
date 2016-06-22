'use strict';

const dobby_bot = require('./jslib/dobby_bot');
const dobby_pull = require('./jslib/dobby_pull');
const dobby_spark = require('./jslib/dobby_spark');
const dobby_cass = require('./jslib/dobby_cass');
const async = require('async');

if (process.argv.length < 4) {
  console.log('usage: node dobby.js <channel-name> <spark-token> [-debug]');
  process.exit(1);
}

const channelName = process.argv[2];
var botEmail = null;
const sparkToken = process.argv[3];
const sessions = {};
const isDebug = (process.argv[4] && process.argv[4].toLowerCase() === '-debug');

const findOrCreateSession = (data) => {
  let sessionId;
  // Let's see if we already have a session for the roomId
  Object.keys(sessions).forEach(k => {
    if (sessions[k].roomId === data.roomId && sessions[k].personEmail === data.personEmail) {
      // Yep, got it!
      sessionId = k;
    }
  });
  if (!sessionId) {
    // No session found for roomId, let's create a new one
    sessionId = new Date().toISOString();
    sessions[sessionId] = { roomId: data.roomId, personEmail: data.personEmail, context: {botId: '111'} };
    console.log("created new session:", sessions[sessionId]);
  }
  return sessionId;
};

const mergeContext = (sessionId, context) => {
  // console.log("merging context:", sessions[sessionId].context);
  // check if this is command, return without merging
  if (context.botId == sessions[sessionId].context.botId) {
    if (context.topic) {
      sessions[sessionId].context.topic = context.topic;
    } else {
      context.topic = sessions[sessionId].context.topic;
    }
    if (context.intent) {
      sessions[sessionId].context.intent = context.intent;
    } else {
      context.intent = sessions[sessionId].context.intent;
    }
    if (context.state) {
      sessions[sessionId].context.state = context.state;
    } else {
      context.state = sessions[sessionId].context.state;
    }
    if (context.input) {
      sessions[sessionId].context.input = context.input;
    } else {
      context.input = sessions[sessionId].context.input;
    }
    sessions[sessionId].context.message = context.message;
  }
};

// const nextEntry = (intent, topic, state, input) => {
const nextEntry = (context, nextEntryCB) => {
  var next = null;
  if (!context.intent) {
    context.intent = '1';
  }
  if (!context.topic) {
    context.topic = '1';
  }
  if (!context.state) {
    context.state = '1';
  }
  if (!context.input) {
    context.input = '1';
  }

  function convertResult(row) {
    var res = {};
    res.n_state = row.n_state ? row.n_state : null;
    res.n_intent = row.n_intent ? row.n_intent : null;
    res.o_msg = row.o_msg ? row.o_msg : null;
    return res;
  }

  // next = msgs[context.intent][context.topic][context.state][context.input];
  async.series([
    function (callback) {
      if (!next) {
        dobby_cass.getState(context.botId, context.topic, context.intent, context.state, context.input, function (err, result) {
          if (err) {
            next = null;
          } else if (result.rows.length > 0) {
            next = convertResult(result.rows[0]);
          }
          callback(err, null);
        });
      } else {
        callback(null, null);
      }
    },
    function (callback) {
      if (!next) {
        dobby_cass.getState(context.botId, context.topic, context.intent, context.state, '1', function (err, result) {
          if (err) {
            next = null;
          } else if (result.rows.length > 0) {
            next = convertResult(result.rows[0]);
          }
          callback(err, null);
        });
      } else {
        callback(null, null);
      }
    },
    function (callback) {
      if (!next) {
        dobby_cass.getState(context.botId, context.topic, context.intent, '1', '1', function (err, result) {
          if (err) {
            next = null;
          } else if (result.rows.length > 0) {
            next = convertResult(result.rows[0]);
          }
          callback(err, null);
        });
      } else {
        callback(null, null);
      }
    },
    function (callback) {
      if (!next) {
        dobby_cass.getState(context.botId, context.topic, '1', '1', '1', function (err, result) {
          if (err) {
            next = null;
          } else if (result.rows.length > 0) {
            next = convertResult(result.rows[0]);
          }
          callback(err, null);
        });
      } else {
        callback(null, null);
      }
    },
    function (callback) {
      if (!next) {
        dobby_cass.getState(context.botId, '1', '1', '1', '1', function (err, result) {
          if (err) {
            next = null;
          } else if (result.rows.length > 0) {
            next = convertResult(result.rows[0]);
          }
          callback(err, null);
        });
      } else {
        callback(null, null);
      }
    }
  ], function (err, results) {
    nextEntryCB(next);
  });
};

const actions = {
  say(sessionId, context, message, cb) {
    // console.log(message);
    // send message to spark room
    const roomId = sessions[sessionId].roomId;
    if (roomId) {
      // we have a room for this sesssion, send message there
      dobby_spark.sendMessage(sparkToken, roomId, message, (err, data) => {
        if (err) {
          console.log(
            'Oops! An error occurred while forwarding the response to',
            roomId,
            ':',
            err
          );
        } else {
          isDebug && dobby_spark.sendMessage(sparkToken, roomId, JSON.stringify(context), (err, data) => {});
        }
      });
    } else {
      console.log("did not find any room Id");
    }
    cb();
  },
  merge(sessionId, context, entities, message, cb) {
    // console.log("entities:", entities);
    // console.log("context", context);
    // console.log("session context:", sessions[sessionId].context);
    // const topic = bestEntityValue(entities, 'topic');
    const topic = entities['topic'];
    if (topic) {
    // if (!sessions[sessionId].context.topic && topic) {
      // sessions[sessionId].context.topic = topic;
      context.topic = topic;
    }
    // const intent = bestEntityValue(entities, 'intent');
    const intent = entities['intent'];
    if (intent) {
      // sessions[sessionId].context.intent = intent;
      context.intent = intent;
      // // special handling of command
      // if (intent == 'command') {
      //   sessions[sessionId].context.topic = 'command';
      //   sessions[sessionId].context.intent = null;
      //   context.intent = null;
      // }
    }
    // const input = bestEntityValue(entities, 'input');
    const input = entities['input'];
    if (input) {
      // sessions[sessionId].context.input = input;
      context.input = input;
    }
    // sessions[sessionId].context.message = message;
    context.message = message;
    cb(context);
  },
  error(sessionId, context, err) {
    console.log(err.message);
    actions.clean(sessionId, context);
  },
  clean(sessionId, context, cb) {
    console.log("cleaning up state/context");
    context = {};
    delete sessions[sessionId];
    cb(context);
  },
  nextState(sessionId, context, cb) {
    mergeContext(sessionId, context);
    sessions[sessionId].context.input = null;
    // console.log("nextState context:", context);
    nextEntry(context, function (result) {
      var next = result;
      // intent switch takes place immediately
      if (next.n_intent) {
        // sessions[sessionId].context.intent = next.n_intent;
        // sessions[sessionId].context.state = next.n_state;
        // special handling of command intents
        if (next.n_intent == '#execute') {
          // context.intent = next.n_intent;
          context.state = next.n_state;
          dobby_bot.runCommand(sessions[sessionId].context.botId, actions, sessionId, context, cb);
        } else {
          // actions.nextState(sessions[sessionId].context.botId, sessionId, actions, context, cb);
          context.intent = next.n_intent;
          context.state = next.n_state;
          actions.nextState(sessionId, context, cb);
        }
        return;
      } else {
        context.state = next.n_state;
      }

      // say whatever dobby says
      actions.say(sessionId, context, next.o_msg, cb);

      // run state transition
      if (next.n_state == null) {
        actions.clean(sessionId, context, cb);
      } else {
        sessions[sessionId].context.state = next.n_state;
      }
    });
  },
};

function processSparkMessage(err, d) {
  if (d) {
    // console.log("got message:", d);
    var data = JSON.parse(d);
    const sessionId = findOrCreateSession(data);
    try {
      dobby_bot.runActions(
        actions,
        sessionId, // the user's current session
        data['text'], // the user's message 
        // sessions[sessionId].context, // the user's current session state
        JSON.parse(JSON.stringify(sessions[sessionId].context)), // the user's current session state
        (error, context) => {
          if (error) {
            console.log('Oops! Got an error from Wit:', error);
          } else {
            // Our bot did everything it has to do.
            // Now it's waiting for further messages to proceed.
            // console.log('Waiting for further messages.');
          }
        }
      );
    } catch (e) {
      console.log("parser error:", e);
      dobby_spark.sendMessage(sparkToken, data.roomId, "could not parse response, please wake up Philip!", (err, data) => {
        if (err) {
          console.log(
            'Oops! An error occurred while forwarding the response to',
            data.roomId,
            ':',
            err
          );
        }
      });
    }
  }
}

dobby_spark.whoAmI(sparkToken, (me) => {
  if (me == null) {
    console.log('failed to get identity with spark token: ', process.argv[3]);
    process.exit(1);
  } else {
    console.log("my identity: ", me);
    console.log("Chatbot: " + me.name + " listening on channel: " + channelName);
    botEmail = me.email;
    dobby_pull.getMessages(sparkToken, channelName, botEmail, processSparkMessage);  }
});