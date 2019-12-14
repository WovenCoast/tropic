const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            usage: '<show|load|save|delete> <name:string>',
            usageDelim: ' '
        });
    }

    async run(msg, [type, ...params]) {
        return await this[type](msg, params);
    }

    async show(msg, [name]) {
        name = name.toLowerCase();
        const data = await this.client.providers.default.get('playlists', `${msg.author.id}-${name}`);
        if (!data) return msg.channel.send(':x: The playlist you were searching for is not a saved playlist.')
        const tempSongs = data.songs.map(s => {
            s.requestedBy = this.client.users.find(u => u.id === s.requestedBy);
            return s;
        });
        const embed = new MessageEmbed()
            .setTitle(`${this.toTitleCase(name)}`)
        tempSongs.forEach((song, index) => {
            embed.addField(`${index + 1 + pageLength * (page - 1)}: ${song.info.title.includes(song.info.author) ? song.info.title.split(song.info.author).join(`*${song.info.author}*`) : `(*${song.info.author}*) - ${song.info.title}`}`, `\nLength: **${this.parse(song.info.length)}**\nURL: ${song.info.uri}`)
        });
        return msg.channel.send(embed);
    }

    async load(msg, [name]) {
        name = name.toLowerCase();
        const data = await this.client.providers.default.get('playlists', `${msg.author.id}-${name}`);
        if (!data) return msg.channel.send(':x: The playlist you were searching for is not a saved playlist.')
        var serverQueue = this.client.queue.get(msg.guild.id);
        const tempSongs = data.songs.map(s => {
            s.requestedBy = this.client.users.find(u => u.id === s.requestedBy);
            return s;
        });
        if (!serverQueue) {
            await this.client.commands.get('join').run(msg);
            if (this.client.queue.has(msg.guild.id)) serverQueue = this.client.queue.get(msg.guild.id);
            else return;
        }
        if (msg.flagArgs.override) {
            serverQueue.songs = tempSongs;
            serverQueue.loop = "off";
            await serverQueue.playing === false ? this.client.commands.get('play').play(msg.guild, serverQueue.songs[0]) : serverQueue.player.stop();
            return msg.channel.send(`:white_check_mark: Successfully overrided the current queue with the loaded playlist! Loop has been reset to \`off\`.`);
        } else {
            serverQueue.songs = serverQueue.songs[0] === undefined ? tempSongs : [...serverQueue.songs, ...tempSongs];
            await serverQueue.playing === false ? this.client.commands.get('play').play(msg.guild, serverQueue.songs[0]) : null;
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

    async delete(msg, [name]) {
        name = name.toLowerCase();
        if (!(await this.client.providers.default.has('playlists', `${msg.author.id}-${name}`))) return msg.channel.send(`:x: You can't delete what you didnt save!`);
        try {
            await this.client.providers.default.delete('playlists', `${msg.author.id}-${name}`);
            return msg.channel.send(`:white_check_mark: Successfully deleted the playlist named \`${name}\`!`);
        } catch (error) {
            return msg.channel.send(`:octagonal_sign: Something went terribly wrong:- \`\`\`${error.message}\`\`\``);
        }
    }
};