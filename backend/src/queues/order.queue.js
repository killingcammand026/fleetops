import {Queue} from "bullmq"
import { redisConnection } from "../config/redis.config.js"

export const orderQueue=new Queue("orderQueue",{
    connection:redisConnection
});