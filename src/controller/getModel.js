import connections from "../config/connections"
export const getModel = (orgId, model, schema) => {
  let conn = connections.getConnection(orgId)
  let dbModel = conn.connection.model(model, schema)
  return dbModel
}
