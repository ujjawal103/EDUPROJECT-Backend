// server.js

const http = require("http");
const app = require("./app");
const connectToMongo = require("./db/db");
const { initializeSocket } = require("./socket");
const port = process.env.PORT || 3000;

async function startServer() {
    try {
        await connectToMongo();

        const server = http.createServer(app);

        initializeSocket(server);

        server.listen(process.env.PORT, () => {
            console.log("Server running" , process.env.PORT);
        });

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

startServer();