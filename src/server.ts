import connectDB from "./db/index";
import config from "./config/index";
import app from "./app.js";

// On Vercel the app runs as a serverless function: Vercel imports the default
// export and handles requests itself, so we must not open a port there.
// Locally (npm run dev / npm start) we connect to the DB and listen as before.
if (!process.env.VERCEL) {
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
}

export default app;
