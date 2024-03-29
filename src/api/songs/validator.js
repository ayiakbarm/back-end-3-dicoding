const Joi = require('joi');
const InvariantError = require('../../exceptions/InvariantError');

const currentYear = new Date().getFullYear();
const songPayloadSchema = Joi.object({
  title: Joi.string().required(),
  year: Joi.number().integer().min(1900).max(currentYear)
    .required(),
  genre: Joi.string().required(),
  performer: Joi.string().required(),
  duration: Joi.number(),
  albumId: Joi.string(),
});

const SongValidator = {
  validateSongPayload: (payload) => {
    const validationResult = songPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = SongValidator;
