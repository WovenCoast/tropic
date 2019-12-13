const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const { URLSearchParams } = require("url");
const fetch = require("node-fetch");

const cancelTerms = ['cancel', 'stop', 'abort']

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: [],
            description: language => language.get('COMMAND_PLAY_DESCRIPTION'),
            usage: '<searchterm:string>'
        });
    }

    async run(msg, [searchterm]) {
        if (!msg.member || !msg.member.voice.channel) return msg.reply(":x: You must be in a voice channel for this command.");

        const track = searchterm.replace(/--(sc|soundcloud|search|srch)/, '').replace(/\s+/g, ' ').trim();
        const songs = await this.getSongs(`${(msg.flagArgs.soundcloud || msg.flagArgs.sc) ? 'scsearch' : 'ytsearch'}:${track}`);
        if (!songs[0]) return msg.reply(":shrug: No songs found with that same term, try again!");

        var songIndex = 0;
        if (msg.flagArgs.search || msg.flagArgs.srch) {
            const promptEmbed = new MessageEmbed()
                .setColor(this.client.primaryColor)
                .setTitle('Choose a song from below! Send only the number of the song, or else it might not work')
                .setFooter('Send the message "abort", "cancel" or "stop" to cancel the search');
            songs.slice(0, 5).forEach((song, index) => song ? promptEmbed.addField(`${index + 1}: ${song.info.title.includes(song.info.author) ? song.info.title.split(song.info.author).join(`*${song.info.author}*`) : `(*${song.info.author}*) - ${song.info.title}`}`, `Length: **${this.parse(song.info.length)}**\nURL: ${song.info.uri}`) : null)
            const promptMessage = await msg.prompt(promptEmbed);
            if (cancelTerms.includes(promptMessage.content.toLowerCase())) return msg.reply(':white_check_mark: Cancelled!');
            songIndex = parseInt(promptMessage.content) - 1;
        }

        let serverQueue = this.client.queue.get(msg.guild.id);
        const song = songs[songIndex];
        song.requestedBy = msg.author;
        this.client.console.log(song);
        if (!serverQueue) {
            const queueConstruct = {
                textChannel: msg.channel,
                voiceChannel: msg.member.voice.channel,
                player: null,
                songs: [song],
                volume: 100,
                playing: true,
                loop: "off"
            };
            this.client.queue.set(msg.guild.id, queueConstruct);

            try {
                queueConstruct.player = await this.client.player.join({
                    guild: msg.guild.id,
                    channel: msg.member.voice.channel.id,
                    host: this.client.player.nodes.first().host
                }, { selfdeaf: true });
                this.play(msg.guild, queueConstruct.songs[0]);
            } catch (error) {
                console.error(`I could not join the voice channel: ${error}`);
                this.client.queue.delete(msg.guild.id);
                this.client.player.leave(msg.guild.id);
                return msg.channel.send(`:x: I could not join the voice channel: ${error.message}`);
            };
        } else {
            serverQueue.songs.push(song);
            return msg.channel.send(`:white_check_mark: Successfully added **${song.info.title}** to queue!`);
        };
    }

    parse(length) {
        const milliseconds = parseInt(length / 1000);
        const seconds = parseInt(milliseconds % 60);
        const minutes = parseInt((milliseconds / 60) % 60);
        const hours = parseInt((milliseconds / 60) / 60);
        return `${hours ? hours + ':' : ''}${minutes + ':' + (seconds < 10 ? '0' + seconds : seconds)}`;
    }

    async getSongs(search) {
        const params = new URLSearchParams();
        params.append("identifier", search);

        return fetch(`http://localhost:2333/loadtracks?${params.toString()}`, { headers: { Authorization: process.env.LAVALINK_PWD } })
            .then(res => res.json())
            .then(data => data.tracks)
            .catch(err => {
                console.error(err);
                return err;
            });
    }

    play(guild, song) {
        let serverQueue = this.client.queue.get(guild.id);
        serverQueue.player.volume(serverQueue.volume);
        if (!song) {
            serverQueue.textChannel.send(":octagonal_sign: No more queue to play. The player has been stopped")
            this.client.player.leave(guild.id);
            this.client.queue.delete(guild.id);
            this.client.console.log('player : ' + JSON.stringify(this.client.player, null, 2));
            return;
        } else {
            serverQueue.player.play(song.track)
                .once("error", console.error)
                .once("end", data => {
                    this.client.console.log('end : ' + JSON.stringify(data, null, 2))
                    if (data.reason === "REPLACED") return;

                    if (serverQueue.loop === "loopall") {
                        serverQueue.songs.push(serverQueue.songs.shift());
                    } else if (serverQueue.loop === "off") {
                        serverQueue.songs.shift();
                    };
                    this.play(guild, serverQueue.songs[0])
                });
            serverQueue.player.volume(serverQueue.volume);
            this.client.console.log('player : ' + JSON.stringify(this.client.player, null, 2));
            return serverQueue.textChannel.send(`:arrow_forward: Now playing: **${song.info.title}** by **${song.info.author}**`);
        };
    };
};
