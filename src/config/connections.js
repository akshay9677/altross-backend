import mongoose from "mongoose"
import Organization from "../model/auth/Organization.model"
import { isEmpty } from "../utils/validation"

class Connection {
  constructor() {
    if (isEmpty(Connection.instance)) {
      this.connections = []
      Connection.instance = this
    }
    return Connection.instance
  }

  async createConnection(orgId) {
    const org = await Organization.findOne({ orgId: orgId })
    let { dbName } = org
    let url =
      process.env.MONGO_ACCESS_TOKEN_FIRST +
      dbName +
      process.env.MONGO_ACCESS_TOKEN_LAST
    const conn = await mongoose.createConnection(url, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    })
    this.connections.push({ db: dbName, orgId: orgId, connection: conn })
  }

  getConnection(orgId) {
    let conn = this.connections.filter((connection) => {
      return connection.orgId == orgId
    })
    return conn[0]
  }

  getConnectionList() {
    return this.connections
  }
}

const connections = new Connection()
export default connections
