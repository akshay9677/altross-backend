import mongoose from "mongoose"

const connectDB = async (mongoURI) => {
  try {
    let uri = process.env.MONGO_ACCESS_TOKEN_FIRST + mongoURI
    process.env.MONGO_ACCESS_TOKEN_LAST
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    })
    console.log(`MongoDB Connected: ${conn.connection.host}`)
  } catch (err) {
    console.log(`Error: ${err.message}`)
    process.exit(1)
  }
}

const disconnectDB = async () => {
  mongoose.connection.close()
}

export { connectDB, disconnectDB }
