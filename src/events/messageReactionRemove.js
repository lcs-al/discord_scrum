const DailyManager = require('../services/DailyManager');

module.exports = {
	name: 'messageReactionRemove',
	async execute(reaction, user) {
        await DailyManager.handleReactionRemove(reaction, user);
	},
};
