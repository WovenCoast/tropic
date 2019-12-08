const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['q'],
            description: language => language.get('COMMAND_QUEUE_DESCRIPTION'),
            usage: '[page:number]'
        });
        this.pageLength = 3;
    }

    async run(msg, [pageNum]) {
        const serverQueue = this.client.queue.get(msg.guild.id);
        const tempSongs = []
        const pageLength = isNaN(msg.flags.length) ? this.pageLength : msg.flags.length;
        if (!serverQueue) return msg.sendLocale('NO_QUEUE');
        const embed = new MessageEmbed();
        embed
            .setColor('#34393F')
            .setTitle(`Now Played: **${this.parse(serverQueue.player.state.position)} / ${this.parse(serverQueue.songs[0].info.length)}** of ${serverQueue.songs[0].info.title.includes(serverQueue.songs[0].info.author) ? `"${serverQueue.songs[0].info.title.split(serverQueue.songs[0].info.author).join(`*${serverQueue.songs[0].info.author}*`)}"` : `"${serverQueue.songs[0].info.title}" by *${serverQueue.songs[0].info.author}*`}`)
        const page = pageNum || 1;
        for (let i = (pageLength * (page - 1)) + 1; i < (pageLength * page) + 1; i++) {
            serverQueue.songs[i] ? tempSongs.push(serverQueue.songs[i]) : null;
        }
        if (serverQueue.songs.length > (pageLength * page) + 1) {
            embed.setFooter(`Do "${msg.content.split(' ')[0]} ${page + 1}" for more songs in the queue!`)
        }
        tempSongs.forEach((song, index) => {
            embed.addField(`${index + 1 + pageLength * (page - 1)}: ${song.info.title.includes(song.info.author) ? song.info.title.split(song.info.author).join(`*${song.info.author}*`) : `(*${song.info.author}*) - ${song.info.title}`}`, `Requested by: <@${song.requestedBy.id}>\nLength: **${this.parse(song.info.length)}**\nURL: ${song.info.uri}`)
        })
        msg.channel.send(embed)
    }

    parse(length) {
        const milliseconds = parseInt(length / 1000);
        const seconds = parseInt(milliseconds % 60);
        const minutes = parseInt((milliseconds / 60) % 60);
        const hours = parseInt((milliseconds / 60) / 60);
        return `${hours ? hours + ':' : ''}${minutes + ':' + (seconds < 10 ? '0' + seconds : seconds)}`;
    }
};