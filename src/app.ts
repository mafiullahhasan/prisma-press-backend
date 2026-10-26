import express, { Application, Request, Response } from "express";
import cors from "cors"
import config from "./config";
import cookieParser from "cookie-parser";
import { userRoutes } from "./modules/user/user.router";
import { errorHandler } from "./middlewares/error.middleware";
import { authRoutes } from "./modules/auth/auth.router";
import { postRoutes } from "./modules/post/post.router";
import { commentRoutes } from "./modules/comment/comment.router";
import { notFoundHandler } from "./middlewares/notFound.middleware";
import { subscriptionRoutes } from "./modules/subscription/subscription.router";
import { premiumRoutes } from "./modules/premium/premium.router";



const app: Application = express()

app.use(cors({
    origin: config.app_url
}))



app.use("/api/subscription/webhook", express.raw({ type: 'application/json' }))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!')
})

// ===================== Routes ================= //
//  routes
app.use('/api/users', userRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/comments', commentRoutes)
app.use("/api/subscription", subscriptionRoutes)
app.use("/api/premium", premiumRoutes)

// 2. Not Found Handler (Must be placed after all valid routes)
app.use(notFoundHandler);


// Global Error Handler (সব রাউট ও লজিকের পরে এখানে বসবে)
app.use(errorHandler);

export default app