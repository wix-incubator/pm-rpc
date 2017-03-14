import sendChannelMessage from 'message-channel-promise'

export const send = (message, {target, targetOrigin}, transfer) => sendChannelMessage(message, target, {targetOrigin, transfer})

export const sendResponse = (port, intent) => result => port.postMessage({intent, result})