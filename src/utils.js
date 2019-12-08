require('dotenv').config();
module.exports = class Utils {
    static userIsPremium(client, userID) {
        return client.guilds.get('616614413348110336').members.get(userID).roles.has('618365725546905610');
    }
    static guildIsPremium(client, guildID) {
        return client.guilds.get('616614413348110336').channels.find(c => c.name == guildID) != undefined;
    }
}
const catchAsyncErrors = fn => (
    (req, res, next) => {
        const routePromise = fn(req, res, next);
        if (routePromise.catch) {
            routePromise.catch(err => next(err));
        }
    }
);

module.exports.catchAsync = catchAsyncErrors;