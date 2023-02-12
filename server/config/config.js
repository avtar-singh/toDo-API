require("dotenv").config();
const password = encodeURIComponent(process.env.DB_PASSWORD);
var env = process.env.NODE_ENV;

if (env === "development") {
  process.env.MONGODB_URI = `${process.env.LOCAL_MONGODB_URI}${process.env.DEV_DB_NAME}`;
} else if (env === "test") {
  process.env.MONGODB_URI = `${process.env.LOCAL_MONGODB_URI}${process.env.TEST_DB_NAME}`;
} else if (env === "production") {
  process.env.MONGODB_URI = `mongodb+srv://${process.env.DB_USERNAME}:${password}@${process.env.ATLAS_MONGODB_URI}`;
}


