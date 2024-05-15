import { Perception } from "@opensouls/engine";

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

export function getDiscordUserIdFromPerception(perception: Perception | null | undefined) {
  return perception?._metadata?.discordUserId as string | undefined;
}

export function getDiscordEventFromPerception(perception: Perception | null | undefined): DiscordEventData | undefined {
  if (!perception) {
    return undefined;
  }

  return perception._metadata?.discordEvent as DiscordEventData;
}

export function getMetadataFromPerception(perception: Perception | null | undefined) {
  const discordUserId = getDiscordUserIdFromPerception(perception) || "anonymous-123";
  const discordEvent = getDiscordEventFromPerception(perception);
  const { userName, userDisplayName } = getUserDataFromDiscordEvent(discordEvent);

  return {
    content: perception?.content,
    discordUserId,
    userName,
    userDisplayName,
    discordEvent,
  };
}

export function getUserDataFromDiscordEvent(discordEvent: DiscordEventData | undefined) {
  const userName = discordEvent?.atMentionUsername || "Anonymous";
  const userDisplayName = discordEvent?.userDisplayName || "Anonymous";

  return {
    userName,
    userDisplayName,
  };
}