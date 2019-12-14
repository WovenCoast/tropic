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
        // Important Tweaks
        this.primaryColor = "#36393F";
        // Economy Functionality
        this.economy = {
            currency(amount) {
                return `${amount} TC`;
            }
        }

        // Music Functionality
        this.queue = new Collection()
        this.player = null;
        this.on('ready', () => {
            this.player = new PlayerManager(client, nodes, {
                user: client.user.id,
                shards: shardCount
            })
        })
        // Music Playlist Functionality
        // this.playlist = {
        //     load(userID, name) {
        //         return this.providers.default.get('playlists', `${userID}-${name}`);
        //     },
        //     save(userID, name, songs) {
        //         this.providers.default.delete('playlists', `${userID}-${name}`);
        //         return this.providers.default.create('playlists', `${userID}-${name}`, songs);
        //     }
        // };

        this.on('commandError', this.console.error);

        // Form Functionality
        this.forms = {
            getForm: (id) => {
                return this.providers.default.get('forms', id);
            },
            createForm: (data) => {
                var id = '';
                if (!data.vanityID) {
                    const length = 6;
                    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
                    for (var i = length; i > 0; --i) id += chars[Math.floor(Math.random() * chars.length)];
                } else id = data.vanityID;
                this.providers.default.create('forms', id, data);
                return id;
            },
            submitForm: (id, data) => {
                const form = this.providers.default.get('forms', id);
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
                this.providers.default.db.collection('forms').doc(id).collection('submissions').doc(data.user).set(this.providers.default.parseUpdateInput(data));
            }
        }
    }
}
Client.use(require('klasa-member-gateway'));

Client.defaultClientSchema.add('restart', folder => folder
    .add('message', 'messagepromise')
    .add('timestamp', 'bigint', { min: 0 }));
Client.defaultGuildSchema.add('shop', folder => folder
    .add('itemname', 'string')
    .add('rewardRole', 'role')
    .add('price', 'number'), {
    array: true,
    default: [],
    configurable: false
});
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
    slowmode: 2,
    preserveSettings: false,
    providers: { default: 'firestore', firestore: { credentials: require('../firebase-config.json'), databaseURL: 'https://tropic-discord-bot.firebaseio.com' } },
    cmdEditing: true,
    typing: true,
    cmdPrompt: true,
    pieceDefaults: {
        commands: {
            cooldown: 1,
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
client.login(process.env.DISCORD_TOKEN);
// Express stuff
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const asyncRoute = require('route-async');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, './public/')))
app.use('/form/', express.static(path.join(__dirname, './public/')))
app.use('/dashboard/', express.static(path.join(__dirname, './public/')))
app.use(session({ secret: 'nyan the keyboard cat', resave: false, saveUninitialized: false, cookie: {} }))
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views/'));

async function buildHelp() {
    const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
    const help = {};
    const commandNames = [...client.commands.keys()];
    await Promise.all(client.commands.map((command) => {
        if (!has(help, command.category)) help[command.category] = {};
        if (!has(help[command.category], command.subCategory)) help[command.category][command.subCategory] = [];
        const description = isFunction(command.description) ? command.description(client.languages.get('en-US')) : command.description;
        help[command.category][command.subCategory].push({ name: command.name, usage: command.usage.usageString.split(' ').map(e => { return { required: e.startsWith('<') == true, string: e.slice(1, -1) } }) });
    }));
    return help;
}
async function buildNavbarData(req) {
    return { req, loggedin: req.session.user !== undefined, user: await getUserInfo(req) }
}

app.get('/discord', asyncRoute(async (req, res) => {
    res.redirect('https://discord.gg/YPyAkMm');
}));
app.get('/invite', asyncRoute(async (req, res) => {
    res.redirect(client.invite);
}));
app.get('/patreon', asyncRoute(async (req, res) => {
    res.redirect('https://patreon.com/discordtropic');
}));
app.get('/', asyncRoute(async (req, res) => {
    res.render('index.ejs', { navbar: await buildNavbarData(req) });
}));
app.get('/donate', asyncRoute(async (req, res) => {
    res.render('donate.ejs');
}));
app.get('/commands', asyncRoute(async (req, res) => {
    const commands = await buildHelp();
    const prefix = client.options.prefix[0];
    res.render('commands.ejs', { navbar: await buildNavbarData(req), commands, prefix })
}));
// Dashboard stuff
app.get('/dashboard', requireAuth, asyncRoute(async (req, res) => {
    const mutualGuilds = (await getUserInfo(req)).guilds.filter(g => client.guilds.get(g.id)).map(g => client.guilds.get(g.id));
    res.render('dashboard.ejs', { navbar: await buildNavbarData(req), user: await getUserInfo(req), mutualGuilds, guild: null });
}))
app.get('/dashboard/:guildid', requireAuth, asyncRoute(async (req, res) => {
    const params = req.params;
    const user = await getUserInfo(req);
    const selectedGuild = user.guilds.find(g => g.id == params.guildid);
    if (client.guilds.find(f => f.id === selectedGuild.id)) {
        console.log(Object.values(Client.defaultGuildSchema.toJSON()).map(c => c));
        res.render('dashboard.ejs', { navbar: await buildNavbarData(req), user, guild: selectedGuild, config: JSON.stringify(client.guilds.find(f => f.id === selectedGuild.id).settings.toJSON()), defaultConfig: JSON.stringify(Object.values(Client.defaultGuildSchema.toJSON()).map(c => c)) });
    } else {
        res.render('noDashboard.ejs', { navbar: await buildNavbarData(req), user, guild: selectedGuild, invite: client.invite });
    }
}))
// Form Stuff
app.get('/form', requireAuth, asyncRoute(async (req, res) => {
    res.render('makeForm.ejs', { navbar: await buildNavbarData(req), user: await getUserInfo(req) });
}));
app.get('/form/:formid', requireAuth, asyncRoute(async (req, res) => {
    const params = req.params;
    const form = client.forms.getForm(params.formid);
    res.render('form.ejs', { navbar: await buildNavbarData(req), form })
}));
app.post('/form/make/new', requireAuth, asyncRoute(async (req, res) => {
    const data = req.body;
    const id = client.forms.createForm(data);
    res.json({ id });
}));
app.post('/form/submit/:id', asyncRoute(async (req, res) => {
    const data = req.body;
    const { id } = req.params;
    data.user = await getUserInfo(req);
    client.forms.submitForm(id, data);
    res.send('success.ejs', { navbar: await buildNavbarData(req) })
}))
// Discord Login
const btoa = require('btoa')
var scopes = ['identify', 'guilds', 'guilds.join'];

app.get('/login', asyncRoute(function async(req, res) {
    const returnTo = req.query.returnTo || (process.env.DEBUG ? "http://localhost:5000/" : "http://tropic.dev/");
    req.session.returnTo = returnTo;
    res.redirect(`https://discordapp.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&scope=${scopes.join('%20')}&response_type=code&redirect_uri=${encodeURIComponent(process.env.DISCORD_AUTH_CALLBACK)}`);
}));
app.get('/callback', asyncRoute(async (req, res) => {
    if (!req.query.code) throw new Error('NoCodeProvided');
    const code = req.query.code;
    const creds = btoa(`${process.env.DISCORD_CLIENT_ID}:${process.env.DISCORD_CLIENT_SECRET}`);
    const response = await fetch(`https://discordapp.com/api/oauth2/token?grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(process.env.DISCORD_AUTH_CALLBACK)}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${creds}`,
            },
        });
    const json = await response.json();
    req.session.user = json;
    res.redirect(req.session.returnTo);
    req.session.returnTo = null;
}));

function requireAuth(req, res, next) {
    if (req.session.user !== undefined) return next();
    console.log(req.originalUrl);
    res.redirect('/login?returnTo=' + encodeURIComponent(req.originalUrl));
}
async function getUserInfo(req) {
    const token = req.session.user !== undefined ? req.session.user.access_token : null;
    if (!token) return;
    var data = {};
    const fetchDiscordUserInfo = await fetch('http://discordapp.com/api/users/@me', {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });
    const fetchUserGuildsInfo = await fetch('http://discordapp.com/api/users/@me/guilds', {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });
    data = await fetchDiscordUserInfo.json();
    data.guilds = await fetchUserGuildsInfo.json();
    if (data.guilds.find(g => g.id === "616614413348110336") === undefined) {
        await fetch(`http://discordapp.com/api/guilds/616614413348110336/members/${data.id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
    }
    return data;
}

// DBL API Stuff
const http = require('http');
// const DBL = require('dblapi.js');
const server = http.createServer(app);
// const dbl = new DBL(process.env.DBL_TOKEN, { webhookAuth: 'password', webhookServer: server });

// dbl.webhook.on('ready', hook => {
//     client.console.log(`Webhook running with path ${hook.path}`);
// });
// dbl.webhook.on('vote', vote => {
//     client.console.log(`User with ID ${vote.user} just voted!`);
// });

server.listen(process.env.PORT, (err) => {
    if (err) return err;
    client.console.log(`Listening on port ${process.env.PORT}`);
});