import express, { Application, Request, Response } from "express";
import cors from "cors"
import config from "./config/index.js";
import cookieParser from "cookie-parser";
import { userRoutes } from "./modules/user/user.router.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { authRoutes } from "./modules/auth/auth.router.js";
import { postRoutes } from "./modules/post/post.router.js";
import { commentRoutes } from "./modules/comment/comment.router.js";
import { notFoundHandler } from "./middlewares/notFound.middleware.js";
import { subscriptionRoutes } from "./modules/subscription/subscription.router.js";
import { premiumRoutes } from "./modules/premium/premium.router.js";



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