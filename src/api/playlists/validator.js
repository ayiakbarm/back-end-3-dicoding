const Joi = require('joi');
const InvariantError = require('../../exceptions/InvariantError');

const PlaylistPayloadSchema = Joi.object({
  name: Joi.string().required(),
});

const PlaylistSongsPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

const PlaylistValidator = {
  validatePlaylistPayload: (payload) => {
    const validationResult = PlaylistPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validatePlaylistSongsPayload: (payload) => {
    const validationResult = PlaylistSongsPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = PlaylistValidator;
