import { prisma } from "../lib/prisma";


const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log("Prisma Database Connected Successfully !!!");
    } catch (error) {
        console.log("Prisma Database connection error: ", error);
        await prisma.$disconnect();
        process.exit(1);
    }
};

export default connectDB;