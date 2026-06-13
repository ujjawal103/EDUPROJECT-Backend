const { Server } = require("socket.io");


let io = null;



function initializeSocket(server) {
    io = new Server(server, {
        cors: {
            origin: "*", 
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log(`Socket connected: ${socket.id}`);

        
        
        socket.on("join", async (data) => {
            const { userId , userType } = data;
            
            if (userType === "user") {
                const user = await userModel.findByIdAndUpdate(userId, { socketId: socket.id }, { new: true });
                if (user) {     
                     console.log(`User ${user.fullName?.firstName} joined with socket ID: ${socket.id}`);
                }
            }
            if (userType === "barberStore") {
                const store = await barberStoreModel.findByIdAndUpdate(userId, { socketId: socket.id }, { new: true });
                if (store) {
                     console.log(`Barber ${store.storeName} joined with socket ID: ${socket.id}`);
                }
            }
        });





        socket.on("update-user-location", async (data) => {
            const { userId, location } = data;
            
            if(!location || !location.ltd || !location.lang) {
                socket.emit("error", { message: "Invalid location data" });
                return;
            }

            const updatedUser = await userModel.findByIdAndUpdate(
                userId,
                { location: { lang: location.lang , ltd: location.ltd } },
                { new: true }
            );
            if (updatedUser) {
                // console.log(`User ${updatedUser.fullName?.firstName} location updated to:`, updatedUser.location);
            }
        });
        socket.on("update-store-location", async (data) => {
            const { storeId, location } = data;

            if(!location || !location.ltd || !location.lang) {
                socket.emit("error", { message: "Invalid location data" });
                return;
            }

            const updatedStore = await barberStoreModel.findByIdAndUpdate(
                storeId,
                { location: { lang: location.lang , ltd: location.ltd } },
                { new: true }
            );
            if (updatedStore) {
                console.log(`Store ${updatedStore.storeName} location updated to:`, updatedStore.location);
            }
        });



        socket.on("disconnect", () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });
}



function sendMessageToSocket( socketId , messageobj) {
    
    if (!io) {
        throw new Error("Socket.io not initialized");
    }
    if (socketId) {
        io.to(socketId).emit(messageobj.event, messageobj.data); // send to specific socket
        // console.log(`Message sent to socket ${socketId}:`, messageobj);
    }
}



module.exports = {
    initializeSocket,
    sendMessageToSocket
};