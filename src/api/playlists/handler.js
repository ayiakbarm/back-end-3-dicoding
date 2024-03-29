const autoBind = require('auto-bind');

class PlaylistHandler {
  constructor(services, validator) {
    this._services = services;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;
    const playlistId = await this._services.addPlaylist({ name, owner: credentialId });
    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._services.getPlaylists(credentialId);
    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._services.verifyPlaylistOwner(id, credentialId);
    await this._services.deletePlaylistById(id);
    return {
      status: 'success',
      message: 'Catatan berhasil dihapus',
    };
  }

  async postSongToPlaylistByIdHandler(request, h) {
    this._validator.validatePlaylistSongsPayload(request.payload);
    const { songId } = request.payload;
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._services.verifyPlaylistOwner(playlistId, credentialId);
    await this._services.addSongToPlaylistById(playlistId, songId);
    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke playlist',
    });
    response.code(201);
    return response;
  }

  async getSongOnPlaylistByIdHandler(request) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._services.verifyPlaylistOwner(playlistId, credentialId);
    const playlist = await this._services.getSongOnPlaylistById(playlistId);
    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deleteSongOnPlaylistByIdHandler(request) {
    this._validator.validatePlaylistSongsPayload(request.payload);
    const { songId } = request.payload;
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._services.verifyPlaylistOwner(playlistId, credentialId);
    await this._services.deleteSongOnPlaylistById(playlistId, songId);
    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    };
  }
}

module.exports = PlaylistHandler;
