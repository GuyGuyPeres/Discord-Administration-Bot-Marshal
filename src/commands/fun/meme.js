const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('meme').setDescription('Get a random meme'),
  async execute(interaction) {
    await interaction.deferReply();

    try {
      const response = await fetch('https://meme-api.com/gimme');
      if (!response.ok) throw new Error(`Meme API responded with ${response.status}`);
      const data = await response.json();

      const embed = new EmbedBuilder()
        .setTitle(data.title)
        .setColor(0xff6b6b)
        .setImage(data.url)
        .setFooter({ text: `👍 ${data.ups ?? 0} · r/${data.subreddit ?? 'memes'}` });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Failed to fetch meme:', error);
      await interaction.editReply("Couldn't fetch a meme right now — try again in a bit.");
    }
  },
};
