const { Extendable } = require('klasa');
const { Guild } = require('discord.js');

module.exports = class extends Extendable {

    constructor(...args) {
        super(...args, {
            appliesTo: [Guild]
        });
        this.dashboard = {
            private: {
                async get(id) {
                    return await this.client.providers.default.get('dashboard', `${id}-${this.id}`);
                },
                async set(id, data = {}) {
                    return await this.client.providers.default.has('dashboard', `${id}-${this.id}`) ? await this.client.providers.default.update('dashboard', `${id}-${this.id}`, data) : await this.client.providers.default.create('dashboard', `${id}-${this.id}`, data);
                }
            },
            welcomeChannel(value) {
                if (typeof value === Boolean) {
                    return Promise.resolve(this.private.set('welcomeChannel', value));
                } else {
                    return Promise.resolve(this.private.get('welcomeChannel') || false);
                }
            },
            discordInvites(value) {
                if (typeof value === Boolean) {
                    return Promise.resolve(this.private.set('discordInvites', value));
                } else {
                    return Promise.resolve(this.private.get('discordInvites') || false);
                }
            }
        }
    }

};