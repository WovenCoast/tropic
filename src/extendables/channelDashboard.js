const { Extendable } = require('klasa');
const { TextChannel } = require('discord.js');

module.exports = class extends Extendable {

    constructor(...args) {
        super(...args, {
            appliesTo: [TextChannel]
        });
        this.dashboard = {
            private: {
                async get(id) {
                    return await this.client.providers.default.get('dashboard', `${id}-${this.guild.id}-${this.id}`);
                },
                async set(id, data = {}) {
                    return await this.client.providers.default.has('dashboard', `${id}-${this.guild.id}-${this.id}`) ? await this.client.providers.default.update('dashboard', `${id}-${this.guild.id}-${this.id}`, data) : await this.client.providers.default.create('dashboard', `${id}-${this.guild.id}-${this.id}`, data);
                }
            },
            welcomeChannel(value) {
                if (typeof value === Boolean) {
                    return Promise.resolve(this.private.set('welcomeChannel', value));
                } else {
                    return Promise.resolve(this.private.get('welcomeChannel') || false);
                }
            },
            leaveChannel(value) {
                if (typeof value === Boolean) {
                    return Promise.resolve(this.private.set('leaveChannel', value));
                } else {
                    return Promise.resolve(this.private.get('leaveChannel') || false);
                }
            },
            subreddits(value) {
                if (typeof value === Array) {
                    return Promise.resolve(this.private.set('subreddits', value));
                } else {
                    return Promise.resolve(this.private.get('subreddits') || []);
                }
            },
            discordInvites(value) {
                if (typeof value === Boolean) {
                    return Promise.resolve(this.private.set('discordInvites', value));
                } else {
                    return Promise.resolve(this.private.get('discordInvites') || this.guild.dashboard.discordInvites());
                }
            }
        }
    }

};