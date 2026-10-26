import connectDB from "./db/index";
import config from "./config/index";
import app from "./app.js";



const PORT = config.port

connectDB()
    .then(() => {
        const server = app.listen(PORT, () => {
            console.log(`Server is running on port : ${PORT}`);
        });

        server.on("error", (error) => {
            console.log("Server error: ", error);
        });
    })
    .catch((error) => {
        console.log("Database connection failed !!!", error);
    });