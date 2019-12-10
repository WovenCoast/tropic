const { Event } = require('klasa');
const statuses = [
    'Tropically extraordinary!',
    'Ducks live in the Tropic!',
    'Watch out, the Tropics are coming.'
];
const statusDelay = 15;
module.exports = class extends Event {

    constructor(...args) {
        super(...args, {
            enabled: true,
            event: 'ready',
            once: false
        });
    }

    run() {
        setInterval(() => {
            const currentStatus = Math.floor(Math.random() * statuses.length);
            this.client.user.setActivity({ name: `${Math.random() > 0.5 ? `${this.client.users.size} users` : `${this.client.guilds.size} guilds`} : ${process.env.PREFIX}help : ${statuses[currentStatus]}`, type: "WATCHING" });
        }, statusDelay * 1000);
    }

};