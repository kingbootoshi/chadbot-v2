import { ActionEvent, Soul } from "@opensouls/engine";
import { Client, Events, Message, Interaction, ReplyOptions, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { getMetadataFromActionEvent, makeMessageCreateDiscordEvent } from "./eventUtils.js";
import fs from 'fs';
import path from 'path';

export type DiscordEventData = {
  type: "messageCreate";
  messageId: string;
  channelId: string;
  guildId: string;
  userId: string;
  userDisplayName: string;
  atMentionUsername: string;
  repliedToUserId?: string;
};

export type DiscordAction = "chatted" | "joined";

export type SoulActionConfig =
  | {
      type: "says";
      sendAs: "message" | "reply";
    }

export class SoulGateway {
  private soul;
  private client;
  private userMessageTimestamps: Map<string, number>;

  constructor(client: Client) {
    this.client = client;
    this.soul = new Soul({
      organization: process.env.OPEN_SOULS_ORGANIZATION!,
      blueprint: process.env.SOUL_ENGINE_BLUEPRINT!,
      soulId: process.env.SOUL_ID || undefined,
      token: process.env.SOUL_ENGINE_API_KEY || undefined,
    });

    this.handleInteraction = this.handleInteraction.bind(this);
    this.userMessageTimestamps = new Map();
    this.handleMessage = this.handleMessage.bind(this);
    this.onSoulSays = this.onSoulSays.bind(this);
  }

  start(readyClient: Client<true>) {
    this.soul.on("says", this.onSoulSays);

    this.soul.connect();

    console.log("Connected discord to soul!")

    this.soul.setEnvironment({
      discordUserId: readyClient.user.id,
    });

    this.client.on(Events.MessageCreate, this.handleMessage);
    this.client.on(Events.InteractionCreate, this.handleInteraction);
  }

  stop() {
    this.client.off(Events.MessageCreate, this.handleMessage);
    this.client.off(Events.InteractionCreate, this.handleInteraction);

    return this.soul.disconnect();
  }

  async onSoulSays(event: ActionEvent) {
    const { content, _metadata } = event;
  
    const { discordEvent, actionConfig } = getMetadataFromActionEvent(event);
    if (!discordEvent) return;
  
    let reply: ReplyOptions | undefined = undefined;
    if (discordEvent.type === "messageCreate" && actionConfig?.sendAs === "reply") {
      reply = {
        messageReference: discordEvent.messageId,
      };
    }
  
    try {
      const channel = await this.client.channels.fetch(discordEvent.channelId);
      if (channel && channel.isTextBased()) {
        await channel.sendTyping();
  
        const message = await this.client.channels.cache.get(discordEvent.channelId)?.messages.fetch(discordEvent.messageId);
        const messageContent = message?.content || '';
        const botId = this.client.user?.id;
        const cleanedMessageContent = messageContent.replace(new RegExp(`<@${botId}>`, 'g'), '').trim();
        const title = `Chadbot answers: ${cleanedMessageContent}`;

        const descriptionContent = await content();
        const truncatedDescription = descriptionContent.length > 4096 ? descriptionContent.slice(0, 4093) + '...' : descriptionContent;

        const embed = new EmbedBuilder()
          .setColor(0xF7931A) // Bitcoin orange
          .setTitle(title.length > 256 ? title.slice(0, 253) + '...' : title)
          .setDescription(truncatedDescription);
  
        const row = new ActionRowBuilder<ButtonBuilder>()
          .addComponents(
            new ButtonBuilder()
              .setCustomId(`correct`)
              .setLabel('👍')
              .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
              .setCustomId(`wrong`)
              .setLabel('👎')
              .setStyle(ButtonStyle.Danger)
          );
  
        await channel.send({
          embeds: [embed],
          components: [row],
          reply,
        });
      }
    } catch (error) {
      console.error(`Failed to send message in guild ${discordEvent.guildId}, channel ${discordEvent.channelId}`);
    }
  }

  async handleMessage(discordMessage: Message) {
    const messageSenderIsBot = !!discordMessage.author.bot;
    const botMentioned = discordMessage.mentions.has(this.client.user?.id || '');
    const shouldIgnoreMessage = messageSenderIsBot || !botMentioned;
    if (shouldIgnoreMessage) {
      return;
    }

    const userId = discordMessage.author.id;
    const now = Date.now();
    const lastMessageTimestamp = this.userMessageTimestamps.get(userId);

    if (lastMessageTimestamp && now - lastMessageTimestamp < 10000) {
      // If the user has sent a message within the last 10 seconds, ignore this message
      const waitTime = 10; // in seconds
      const remainingTime = waitTime - Math.floor((now - lastMessageTimestamp) / 1000);
      try {
        const channel = await this.client.channels.fetch(discordMessage.channelId);
        if (channel && channel.isTextBased()) {
          await channel.sendTyping();
          
          const embed = new EmbedBuilder()
            .setColor(0xFF0000) // Red color
            .setTitle("Please wait")
            .setDescription(`Please wait ${remainingTime} more seconds before sending another message.`);
          
          await channel.send({
            embeds: [embed],
          });
        }
      } catch (error) {
        console.error(`Failed to send wait message in channel ${discordMessage.channelId}:`);
      }
      return;
    }

    // Update the timestamp for the user
    this.userMessageTimestamps.set(userId, now);

    const discordEvent = await makeMessageCreateDiscordEvent(discordMessage);
    const userName = discordEvent.atMentionUsername;

    let content = discordMessage.content;
    if (discordEvent.repliedToUserId) {
      content = `<@${discordEvent.repliedToUserId}> ${content}`;
    }

    //THIS IS FOR HANDLING DISCORD MESSAGES CLIENT SIDE AND SENDING THEM TO THE SERVER. IGNORE THIS WHEN WORKING WITH ONSOULSAYS
    this.soul.dispatch({
      action: "said",
      content,
      name: userName,
      _metadata: {
        discordEvent,
        discordUserId: this.client.user?.id,
      },
    });

    const channel = await this.client.channels.fetch(discordMessage.channelId);
    if (channel && channel.isTextBased()) {
      await channel.sendTyping();
    }
  }

  async handleInteraction(interaction: Interaction) {
    if (interaction.isButton()) {
      const buttonId = interaction.customId;
      const messageId = interaction.message.id;
  
      const message = await interaction.channel?.messages.fetch(messageId);
      if (message && message.embeds.length > 0) {
        const embed = message.embeds[0];
        const title = embed.title || '';
        let content = embed.description || '';
  
        if (title.startsWith('Chadbot answers:')) {
          const question = title.replace('Chadbot answers:', '').trim();
          const answer = content;
  
          if (buttonId.startsWith('correct')) {
            content += `\n\n**FEEDBACK RECEIVED:** This answer was rated good/helpful by ${interaction.user.tag}`;
          } else if (buttonId.startsWith('wrong')) {
            content += `\n\n**FEEDBACK RECEIVED:** This answer was rated bad/incorrect by ${interaction.user.tag}`;
          }
  
          // INSERT_YOUR_CODE
          interface Feedback {
            question: string;
            answer: string;
            messageId: string;
            timestamp: string;
            buttonId: string;
          }
  
          const feedbackFilePath = './feedback.json';
  
          function saveFeedback(feedback: Feedback) {
            let feedbackData: Feedback[] = [];
  
            // Read existing feedback data if the file exists
            if (fs.existsSync(feedbackFilePath)) {
              const fileContent = fs.readFileSync(feedbackFilePath, 'utf-8');
              try {
                feedbackData = JSON.parse(fileContent);
                if (!Array.isArray(feedbackData)) {
                  feedbackData = [];
                }
              } catch (error) {
                console.error('Failed to parse feedback file:', error);
                feedbackData = [];
              }
            }
  
            // Add new feedback to the array
            feedbackData.push(feedback);
  
            // Write updated feedback data back to the file
            fs.writeFileSync(feedbackFilePath, JSON.stringify(feedbackData, null, 2), 'utf-8');
          }
  
          const feedback: Feedback = {
            question,
            answer,
            messageId,
            timestamp: new Date().toISOString(),
            buttonId: buttonId.startsWith('correct') ? 'correct' : 'wrong',
          };
  
          saveFeedback(feedback);

          // Truncate fields to 1024 characters if necessary
          const truncatedQuestion = question.length > 1024 ? question.slice(0, 1021) + '...' : question;
          const truncatedAnswer = answer.length > 1024 ? answer.slice(0, 1021) + '...' : answer;

          // Create an embed for the feedback
          const feedbackEmbed = new EmbedBuilder()
            .setColor(buttonId.startsWith('correct') ? 0x00FF00 : 0xFF0000) // Green for correct, Red for wrong
            .setTitle('New Feedback Received')
            .addFields(
              { name: 'Question', value: truncatedQuestion },
              { name: 'Answer', value: truncatedAnswer },
              { name: 'Feedback', value: buttonId.startsWith('correct') ? 'Good/Helpful' : 'Bad/Incorrect' },
              { name: 'User', value: interaction.user.tag },
              { name: 'Timestamp', value: feedback.timestamp }
            );

          // Send the feedback embed to the specified channel
          try {
            const feedbackChannel = await this.client.channels.fetch('1135023272195522680');
            if (feedbackChannel && feedbackChannel.isTextBased()) {
              await feedbackChannel.send({ embeds: [feedbackEmbed] });
            } else {
              console.error('Feedback channel is not text-based or does not exist.');
            }
          } catch (error) {
            console.error('Failed to send feedback message:', error);
          }
  
          const updatedEmbed = new EmbedBuilder()
            .setColor(embed.color)
            .setTitle(embed.title)
            .setDescription(content);
  
          const disabledRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
              new ButtonBuilder()
                .setCustomId(`correct_${messageId}`)
                .setLabel('👍')
                .setStyle(ButtonStyle.Success)
                .setDisabled(true),
  
              new ButtonBuilder()
                .setCustomId(`wrong_${messageId}`)
                .setLabel('👎')
                .setStyle(ButtonStyle.Danger)
                .setDisabled(true)
            );
  
          try {
            await interaction.update({ embeds: [updatedEmbed], components: [disabledRow] });
          } catch (error) {
            console.error('Failed to update interaction:', error);
          }
        }
      }
    }
  }
}