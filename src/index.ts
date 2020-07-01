import DiscordBot from 'dbsc';

const client = new DiscordBot(process.env.TOKEN || '');

client.on('command', (commands, message) => {
  if (message.author.bot) return;
  const firstCommand = commands.shift();
  if (typeof firstCommand !== 'string' || !firstCommand.startsWith('/gbs')) return;
  commands.map(command => message.channel.send(command).then(mes => {
    mes.react('👍');
    mes.react('🤔');
    mes.react('👎');
  }));
});

client.run();