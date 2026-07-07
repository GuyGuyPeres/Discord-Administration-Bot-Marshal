const { DiscordAPIError } = require('discord.js');

// Maps known Discord API error codes to safe, user-facing messages.
// https://discord.com/developers/docs/topics/opcodes-and-status-codes#json-json-error-codes
const KNOWN_API_ERRORS = {
  10003: 'That channel no longer exists.',
  10004: 'That server could not be found.',
  10007: 'That member is no longer in this server.',
  10008: 'That message no longer exists.',
  10011: 'That role no longer exists.',
  10013: 'That user could not be found.',
  10014: "That emoji doesn't exist or I don't have access to it.",
  10062: 'This interaction expired before I could respond. Please run the command again.',
  50001: "I don't have access to do that here.",
  50013: "I don't have permission to do that. Check my role's permissions and position and try again.",
  50024: "That action can't be performed on this channel type.",
  50034: 'I can only bulk-delete messages that are less than 14 days old.',
  50035: 'One of the values provided was invalid.',
  30013: "This server has hit Discord's channel limit, so I couldn't create a new one.",
  30016: "That action isn't allowed right now — please try again shortly.",
};

const GENERIC_MESSAGE = 'Something went wrong while running that command. Please try again, or contact a server admin if it keeps happening.';

function getFriendlyErrorMessage(error) {
  if (error instanceof DiscordAPIError && KNOWN_API_ERRORS[error.code]) {
    return KNOWN_API_ERRORS[error.code];
  }
  return GENERIC_MESSAGE;
}

module.exports = { getFriendlyErrorMessage };
