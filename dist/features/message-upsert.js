export const config = {
    displayName: "Message Upsert",
    dbName: "MESSAGE-UPSERT",
};
export const module = (client) => {
    client.on("messageCreate", (message) => {
        client.emit("messageUpsert", message);
    });
    client.on("messageUpdate", (oldMessage, newMessage) => {
        client.emit("messageUpsert", newMessage, oldMessage);
    });
};
