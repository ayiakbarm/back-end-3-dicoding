const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };
    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username AS username FROM playlists
      LEFT JOIN users ON users.id = playlists.owner
      WHERE playlists.owner = $1 OR users.id = $1`,
      values: [owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlists tidak ditemukan');
    }
    return result.rows;
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async addSongToPlaylistById(playlistId, songId) {
    const songQuery = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [songId],
    };
    const songResult = await this._pool.query(songQuery);
    if (!songResult.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }
    const id = `playlist-${nanoid(16)}`;

    const playlistQuery = {
      text: 'INSERT INTO playlistsongs VALUES($1, $2, $3)',
      values: [id, playlistId, songId],
    };
    await this._pool.query(playlistQuery);
  }

  async getSongOnPlaylistById(playlistId) {
    const playlistQuery = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlistsongs
      INNER JOIN playlists ON playlists.id = playlistsongs.playlist_id
      INNER JOIN users ON users.id = playlists.owner
      WHERE playlistsongs.playlist_id = $1`,
      values: [playlistId],
    };
    const playlistResult = await this._pool.query(playlistQuery);
    if (!playlistResult.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const songQuery = {
      text: `SELECT songs.id, songs.title, songs.performer FROM playlistsongs
      INNER JOIN songs ON songs.id = playlistsongs.song_id
      WHERE playlistsongs.playlist_id = $1`,
      values: [playlistId],
    };
    const songResult = await this._pool.query(songQuery);

    return {
      id: playlistResult.rows[0].id,
      name: playlistResult.rows[0].name,
      username: playlistResult.rows[0].username,
      songs: songResult.rows,
    };
  }

  async deleteSongOnPlaylistById(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlistsongs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id =$1',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }
}

module.exports = PlaylistsService;
