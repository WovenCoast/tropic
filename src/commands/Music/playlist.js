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
        const data = await this.client.providers.default.get('playlists', `${msg.author.id}-${name}`);
        console.log(data);
        return msg.channel.send(JSON.stringify(data));
    }
    async save(msg, [name]) {
        let serverQueue = this.client.queue.get(msg.guild.id);
        if (!serverQueue) return msg.sendLocale('NO_QUEUE');
        serverQueue.songs = serverQueue.songs.map(s => {
            s.requestedBy = s.requestedBy.id || '';
            return s;
        })
        console.log(serverQueue.songs);
        if (await this.client.providers.default.has('playlists', `${msg.author.id}-${name}`)) await this.client.providers.default.update('playlists', `${msg.author.id}-${name}`, { songs: serverQueue.songs });
        else await this.client.providers.default.create('playlists', `${msg.author.id}-${name}`, { songs: serverQueue.songs });

    }
};