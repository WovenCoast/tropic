const { Command } = require('klasa');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            usage: '<load|save> <name:string>',
            usageDelim: ' '
        });
    }

    async run(msg, [type, ...params]) {
        return await this[type](msg, params);
    }

    async load(msg, [name]) {
        const data = this.client.providers.default.get('playlists', `${msg.author.id}-${name}`);
        console.log(data);
        return msg.channel.send(JSON.stringify(data));
    }
    async save(msg, [name]) {

    }
};