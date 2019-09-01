const { Command } = require('klasa');
const { URLSearchParams } = require("url");
const fetch = require("node-fetch");

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

        const track = searchterm;
        const [song] = await this.getSongs(`${msg.flags.soundcloud ? 'scsearch' : 'ytsearch'}: ${track}`);
        if (!song) return msg.reply(":shrug: No songs found with that same term, try again!");

        let serverQueue = this.client.queue.get(msg.guild.id);
        song.requestedBy = msg.author;
        if (!serverQueue) {
            const queueConstruct = {
                textChannel: msg.channel,
                voiceChannel: msg.member.voice.channel,
                player: null,
                songs: [song],
                volume: 100,
                playing: true,
                loop: false
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
        if (!song) {
            serverQueue.textChannel.send(":octagonal_sign: No more queue to play. The player has been stopped")
            client.player.leave(guild.id);
            this.client.queue.delete(guild.id);
            return;
        } else {
            serverQueue.player.play(song.track)
                .once("error", console.error)
                .once("end", data => {
                    if (data.reason === "REPLACED") return;

                    const shiffed = serverQueue.songs.shift();
                    if (serverQueue.loop === true) {
                        serverQueue.songs.push(shiffed);
                    };
                    this.play(guild, serverQueue.songs[0])
                });
            serverQueue.player.volume(serverQueue.volume);
            return serverQueue.textChannel.send(`:arrow_forward: Now playing: **${song.info.title}** by **${song.info.author}**`);
        };
    };
};
