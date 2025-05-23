const env = process.env.NODE_ENV;

const prefix = env == "production" ? "/genshin-wish-planner" : "";

export { prefix };
