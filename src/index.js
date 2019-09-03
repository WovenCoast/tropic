require('dotenv').config();
const { Client } = require('klasa');
const { Collection, MessageEmbed } = require('discord.js')
const { PlayerManager } = require('discord.js-lavalink');

const shardCount = 1;
const nodes = [
    { host: "localhost", port: 2333, password: process.env.LAVALINK_PWD }
];

class FlameyClient extends Client {
    constructor(...args) {
        super(...args);
        this.queue = new Collection()
        this.player = null;
        this.on('ready', () => {
            this.player = new PlayerManager(client, nodes, {
                user: client.user.id,
                shards: shardCount
            })
        })
    }
}

const client = new FlameyClient({
    clientOptions: {
        fetchAllMembers: false
    },
    prefix: ['f!'],
    providers: {
        default: "mongodb", mongodb: {
            db: 'flamey',
            connectionString: process.env.MONGO_URL,
            options: { useUnifiedTopology: true }
        }
    },
    cmdEditing: true,
    typing: true,
    cmdPrompt: true,
    cmdEditing: true,
    pieceDefaults: {
        commands: {
            cooldown: 1000,
            promptLimit: 3
        },
        monitors: {
            enabled: true,
            ignoreBots: true,
            ignoreSelf: true,
            ignoreOthers: true,
            ignoreWebhooks: true,
            ignoreEdits: true,
            ignoreBlacklistedUsers: true,
            ignoreBlacklistedGuilds: true
        }
    },
    readyMessage: (client) => `Logged in as ${client.user.tag}!`
})
Client.defaultClientSchema.add('restart', folder => folder
    .add('message', 'messagepromise')
    .add('timestamp', 'bigint', { min: 0 }));

client.login(process.env.DISCORD_TOKEN);