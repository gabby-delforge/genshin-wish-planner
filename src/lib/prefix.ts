const env = process.env.NODE_ENV;

const prefix = env == "production" ? "genshin-wish-planner" : "";

console.log(prefix);

export { prefix };
