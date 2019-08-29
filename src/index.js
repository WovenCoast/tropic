require('dotenv').config();
const { Client } = require('klasa');

const client = new Client({
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
    readyMessage: (client) => `Logged in as ${client.user.tag}!`
})

client.login(process.env.DISCORD_TOKEN);