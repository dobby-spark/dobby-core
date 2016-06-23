/* dobby_spark.js */
'use strict';

const parser = require('./dobby_parse');

module.exports = {
  runActions: runActions,
  runCommand: runCommand,
};

function runCommand(botId, actions, sessionId, context, cb) {
    console.log("running cmd:", context);
    if (context.topic == 'learn') {
		    // delegate learning command to parser
        parser.learn(botId, context, (res) => {
        	actions.say(sessionId, context, res, () => {
        	})
        });
    } else if (context.topic == 'forget') {
        // delegate list command to parser
        parser.forget(botId, context, (res) => {
          actions.say(sessionId, context, res, () => {
          })
        });
    } else if (context.topic == 'list') {
        // delegate list command to parser
        parser.list(botId, context, (res) => {
          actions.say(sessionId, context, res, () => {
          })
        });
    } else if (context.topic == 'reset') {
      // reset current conversation
      actions.say(sessionId, context, "*poof*", () => {
        actions.clean(sessionId, context, cb);
      });
    } else {
      actions.say(sessionId, context, "dobby do not understand command type " + context.topic, () => {
	    // actions.clean(sessionId, context, cb);
      });
    }
}

function runActions(actions, sessionId, message, context, cb) {
	parser.parseMessage(context, message, (res) => {
		actions.merge(sessionId, context, res, message, (ctx) => {
			actions.nextState(sessionId, ctx, (ctx) => {
			// no op
			});
		})
	});  
};
