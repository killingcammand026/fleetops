import {Redis} from "ioredis"

export const redisConnection=new Redis({
    // host:"127.0.0.1",
    host:"redis",
    port:6379,
    maxRetriesPerRequest:null
});