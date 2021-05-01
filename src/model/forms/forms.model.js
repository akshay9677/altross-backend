import mongoose from "mongoose"

const FieldSchema = new mongoose.Schema({})

export const FormSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: 1 },
    id: { type: Number, required: true, unique: 1 },
    description: { type: String },
    displayName: { type: String },
    groups: [
      {
        fields: [
          {
            id: { type: Number, required: true },
            placeholder: { type: String },
            width: { type: String, enum: ["100%", "50%"] },
            disabled: { type: Boolean },
            required: { type: Boolean },
          },
        ],
      },
    ],
    moduleName: { type: String, required: true },
    labelPosition: { type: String, enum: ["TOP", "LEFT"] },
  },
  { strict: false }
)
