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
        if (!data) return msg.channel.send(':x: The playlist you were searching for is not a saved playlist.')
        console.log(data);
        var serverQueue = this.client.queue.get(msg.guild.id);
        const tempSongs = data.songs.map(s => {
            s.requestedBy = this.client.users.find(u => u.id === s.requestedBy);
            return s;
        });
        if (!serverQueue) {
            this.client.commands.get('join').run(msg);
            if (this.client.queue.has(msg.guild.id)) serverQueue = this.client.queue.get(msg.guild.id);
            else return;
        }
        if (msg.flagArgs.override) {
            serverQueue.songs = tempSongs;
            serverQueue.loop = "off";
            serverQueue.playing === false ? this.client.commands.get('play').play(msg.guild, serverQueue.songs[0]) : serverQueue.player.stop();
            return msg.channel.send(`:white_check_mark: Successfully overrided the current queue with the loaded playlist! Loop has been reset to \`off\`.`);
        } else {
            serverQueue.songs = serverQueue.songs === [] ? tempSongs : [...serverQueue.songs, ...tempSongs];
            serverQueue.playing === false ? this.client.commands.get('play').play(msg.guild, serverQueue.songs[0]) : null;
            return msg.channel.send(`:white_check_mark: Successfully appended the current queue and the loaded playlist! Use the command \`queue\` to see the changes.`);
        }
    }
    async save(msg, [name]) {
        name = name.toLowerCase();
        var tempSongs;
        let serverQueue = this.client.queue.get(msg.guild.id);
        if (!serverQueue) return msg.sendLocale('NO_QUEUE');
        tempSongs = serverQueue.songs.map(s => {
            s.requestedBy = s.requestedBy.id || '';
            return s;
        })
        try {
            if (await this.client.providers.default.has('playlists', `${msg.author.id}-${name}`)) await this.client.providers.default.update('playlists', `${msg.author.id}-${name}`, { songs: tempSongs });
            else await this.client.providers.default.create('playlists', `${msg.author.id}-${name}`, { songs: tempSongs });
            return msg.channel.send(`:white_check_mark: Successfully saved the current queue as the playlist *${name}*, to retrieve the playlist use the command <@${this.client.user.id}>\`playlist load ${name}\`!`);
        } catch (error) {
            return msg.channel.send(`:x: An error occurred during the saving process:-\n\`\`\`${error.message}\`\`\``);
        }
    }
};