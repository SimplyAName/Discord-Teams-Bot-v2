const { SlashCommandBuilder, ChannelType } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('clean')
		.setDescription('Returns all users to selected voice channel and removes teams channels.')
		.addChannelOption(option => option.setName('return-voice-channel')
			.setDescription('The voice channel all remaining team members will be sent too.')
			.addChannelTypes(ChannelType.GuildVoice)
			.setRequired(true)),
	async execute(interaction) {
		const returnChannel = interaction.options.getChannel('return-voice-channel');

		// TODO: Channel name should be set in env to as used in multiple areas
		const teamsCategory = interaction.guild.channels.cache.filter(channel => channel.type == ChannelType.GuildCategory && channel.name == 'Team channels 🏆').first();

		if (teamsCategory != null) {

			const voiceChannels = teamsCategory.children;

			// Move users then delete old voice channels
			await voiceChannels.cache.each(async channel => {

				channel = await channel.fetch();

				console.debug(`Starting process to delete: ${channel.name} with ${channel.members.size} members`);

				channel.members.each(async user => {
					console.debug(`Moving user: ${user.displayName}`);

					await user.voice.setChannel(returnChannel, `Moved to return channel ${returnChannel.name} to clean old teams channels`);
				});

				channel.delete('Cleaning old teams channels');

				console.debug('Finished deleting: ' + channel.name);
			});

			console.debug('Deleting teams channel category');

			// Delete old voice category
			teamsCategory.delete('Cleaning old teams category');

			await interaction.reply(`Teams channels cleaned up and users returned to ${returnChannel.name}`);

		}
		else {

			await interaction.reply('Could not find teams channels!');
		}

	},
};