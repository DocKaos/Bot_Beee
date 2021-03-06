// DotEnv holds environment variables for us
require('dotenv').config();

// Grab TMI Library from Twitch
const tmi = require('tmi.js');

const greetings = ["hey", "hello", "sup", "hi"]
const m8ball_answers = ["Not today.", "Unlikely.", "In your dreams.", "It's a possibility.", "Never.",
                        "Outlook fuzzy.", "Definitely.", "Maybe.", "Fo'sho", "Yes.", "Nope.", "Hard to see."]

// Set up the client
const client = new tmi.Client({
    connection: {
        reconnect: true
    },
    channels: ['juniebeeejones'],
    identity: {
        username: process.env.TWITCH_BOT_USERNAME,
        password: process.env.TWITCH_OAUTH_TOKEN
    }
});

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect
client.connect();

// Called every time a message comes in
function onMessageHandler (target, context, msg, self) {
    if (self) { return; } // Ignore messages from the bot
  
    // Set up command parser
    const commandRegEx = new RegExp(/^!([a-zA-Z0-9]+)(?:\W+)?(.*)?/);
    // Remove whitespace from chat message
    const mainMsg = msg.trim();
    // Look for !commands
    match = msg.match(commandRegEx)
    var command, argument = null;
    if(match) {
        command = match[1];
        argument = match[2];
    }

    if( ! command ) {
        // Check for greetings
        if( greetings.includes(mainMsg.toLowerCase()) ) {
            client.say(target, `${greetings[Math.floor(Math.random() * greetings.length)]} ${context.username}`);
            return;
        }
        // Do we buzz?
        if( matchWords(mainMsg, ["bee", "flower", "honey"]).length ) {
            client.say(target, `Buzz Buzz Baby!`);
            return;
        }
        // RNG
        if( matchWords(mainMsg, ["RNG"]).length) {
            client.say(target, `No Randoms, just Skillz ...`);
            return;
        }
    }
    
  
    // If the command is known, let's execute it
    if( command ) {
        if (command === 'commands') {
            client.say(target, `!roll ##\r\n!8ball question`);
            return;
        }
        else if (command === 'roll') {
            var sides = Number(argument);
            if( sides === NaN ) sides = 6;
            const num = rollDice(sides);
            client.say(target, `You rolled a ${num}`);
            console.log(`* Executed ${command} command ${sides}: ${num}`);
        } else if( command === '8ball') {
            if(!argument) {
                client.say(target, `You need to ask the Magic 8 Ball a question to get an answer.`);
                return;
            } 
            client.say(target, `${argument} : ${m8ball_answers[Math.floor(Math.random() * m8ball_answers.length)]}`);
            return;
        } else {
        console.log(`* Unknown command ${command}`);
        }
    }
  }
  
  // Function called when the "dice" command is issued
  function rollDice (sides) {
    return Math.floor(Math.random() * sides) + 1;
  }
  
  // Called every time the bot connects to Twitch chat
  function onConnectedHandler (addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
  }

  // Word matcher
  function matchWords(subject, words) {
    var regexMetachars = /[(){[*+?.\\^$|]/gi;

    for (var i = 0; i < words.length; i++) {
        words[i] = words[i].replace(regexMetachars, "\\$&");
    }

    var regex = new RegExp("\\b(?:" + words.join("|") + ")\\b", "gi");

    return subject.match(regex) || [];
}
