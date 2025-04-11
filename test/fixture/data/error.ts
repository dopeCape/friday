import { Error, MongooseError } from "mongoose";

export function getNewMongooseValidationError() {
  const error = new Error.ValidationError(new MongooseError("Test Validation error"));
  error.addError("test", getNewMongooseCaseError())
  error.addError("test2", new Error.ValidatorError({ message: "Test error", path: "name" }))
  return error
}

export function getNewMongooseCaseError() {
  return new Error.CastError("CastError", "Test error", "email");
}
