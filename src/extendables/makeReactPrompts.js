const { Extendable } = require('klasa');
const { Message } = require('discord.js');

module.exports = class extends Extendable {
    constructor(...args) {
        super(...args, {
            appliesTo: [Message]
        });
    }

    promptReact(filter, { minReactUsers, duration }) {
        return new Promise((resolve, reject) => {
            const collector = this.createReactionCollector(filter, { time: duration || 30000, maxUsers: minReactUsers });
            collector.on('collect', reaction => {
                console.log(reaction);
                if (reaction.count >= minReactUsers) return resolve(true);
            })
            collector.on('end', collected => {
                resolve(false);
            })
        })
    }
}