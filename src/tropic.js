const path = require('path');
require('dotenv').config({ path: path.join(__dirname, `../${process.platform == 'win32' ? 'dev' : 'prd'}.env`) });
const fetch = require('node-fetch');
// Bot Stuff
const { Client, util: { isFunction } } = require('klasa');
const { Collection, MessageEmbed } = require('discord.js');
const { PlayerManager } = require('discord.js-lavalink');
const fs = require('fs');

const shardCount = 1;
const nodes = [
    { host: "localhost", port: 2333, password: process.env.LAVALINK_PWD }
];

class FlameyClient extends Client {
    constructor(options) {
        super(options);
        // Music Functionality
        this.queue = new Collection()
        this.player = null;
        this.on('ready', () => {
            this.player = new PlayerManager(client, nodes, {
                user: client.user.id,
                shards: shardCount
            })
        })

        this.on('commandError', this.console.error);

        // Form Functionality
        this.forms = {
            cache: {},
            load: (directory) => {
                this.dbdir = path.join(__dirname, directory);
                fs.readFile(this.dbdir, (err, data) => this.cache = JSON.parse(data))
            },
            getForm: (id) => {
                return this.cache[id];
            },
            createForm: (data) => {
                var id = '';
                if (!data.vanityID) {
                    const length = 6;
                    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
                    for (var i = length; i > 0; --i) id += chars[Math.floor(Math.random() * chars.length)];
                } else id = data.vanityID;
                data.id = id;
                this.cache[id] = data;
                fs.writeFile(this.dbdir, JSON.stringify(this.cache, null, 2), (err) => { if (err) throw err; })
                return id;
            },
            submitForm: (id, data) => {
                const form = this.cache[id];
                const embed = new MessageEmbed()
                    .setAuthor(`${form.name} : Submission`, client.user.avatarURL())
                    .setTitle(`${data.user.name} just filled out your form!`)
                    .setFooter('Powered by Tropic')
                    .setURL(`${process.env.DEBUG ? "http://localhost:5000" : "http://tropic.dev"}/form/${form.id}`);
                form.questions.forEach((question, index) => {
                    embed.addField(index + 1 + question.text, data[question.id]);
                })
                if (!form.webhook) {
                    client.users.get(form.user).send(embed)
                } else {
                    fetch(form.webhook,
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: {
                                username: client.user.username,
                                avatar_url: client.user.avatarURL(),
                                embeds: [embed]
                            }
                        });
                }
                data.user = data.user.id;
                this.cache[id].submissions.push(data);
                fs.writeFile(this.dbdir, JSON.stringify(this.cache, null, 2), (err) => { if (err) throw err; })
            }
        }
    }
}
Client.use(require('klasa-member-gateway'));

Client.defaultClientSchema.add('restart', folder => folder
    .add('message', 'messagepromise')
    .add('timestamp', 'bigint', { min: 0 }));
Client.defaultGuildSchema.add('welcomeLeaveChannel', 'textchannel', {
    default: '',
    configurable: true
});
Client.defaultGuildSchema.add('isPremium', 'boolean', {
    default: false,
    configurable: false
});
Client.defaultMemberSchema.add('wallet', 'integer', {
    default: 0,
    configurable: false
});
Client.defaultUserSchema.add('bank', 'integer', {
    default: 0,
    configurable: false
});

const client = new FlameyClient({
    production: process.env.DEBUG == false ? false : true,
    clientOptions: {
        fetchAllMembers: false
    },
    prefix: [process.env.PREFIX],
    providers: { default: 'firestore', firestore: { credentials: require('../firebase-config.json'), databaseURL: 'https://tropic-discord-bot.firebaseio.com' } },
    cmdEditing: true,
    typing: true,
    cmdPrompt: true,
    pieceDefaults: {
        commands: {
            cooldown: 1000,
            promptLimit: 3,
            runIn: ['text']
        },
        monitors: {
            enabled: true,
            ignoreBots: true,
            ignoreSelf: true,
            ignoreOthers: false,
            ignoreWebhooks: true,
            ignoreEdits: true,
            ignoreBlacklistedUsers: true,
            ignoreBlacklistedGuilds: true
        }
    },
    readyMessage: (client) => `Logged in as ${client.user.tag}!`
})
client.forms.load('../forms.json');
client.login(process.env.DISCORD_TOKEN);
module.exports = client;
