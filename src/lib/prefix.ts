const env = process.env.NODE_ENV;

const prefix = env == "production" ? "" : "";

export { prefix };
