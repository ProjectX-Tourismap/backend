import axios from 'axios';
import Database from './Database';

class ManholeMapAPI {
  static get baseURL() {
    return 'http://manholemap.juge.me';
  }

  static get http() {
    if (!this.$http) {
      this.$http = axios.create({
        baseURL: ManholeMapAPI.baseURL,
        params: { format: 'json' },
      });
    }
    return this.$http;
  }

  static get latKM() {
    return 0.0090133729745762;
  }

  static get lngKM() {
    return 0.010966404715491394;
  }

  static res2json(res) {
    return typeof res.data === 'string'
      ? JSON.parse(`{"data":${res.data.replace(/\r?\n/g, ' ').replace(/[\b]/g, '')}}`).data
      : res.data;
  }

  static manholeMap2Graphql(v) {
    const text = v.text.replace(/&lt;br\/&gt;/g, '\n').replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, '');
    const match = text.match(/[、。,.\s/／]/);
    const textSep = match ? match.index : v.text.length;
    return {
      categoryId: Database.categories.indexOf('Manhole'),
      id: v.id,
      name: text.substring(0, textSep) || 'Manhole',
      desc: text.substring(textSep + 1),
      picture: `${ManholeMapAPI.baseURL}/get?id=${v.id}`,
      geo: {
        lat: v.lat,
        lng: v.lng,
      },
    };
  }

  static entity(id) {
    return this.http({
      url: '/customsearch',
      params: { where: `id=${id}` },
    }).then((res) => {
      const json = this.res2json(res)[0];
      if (!json) return null;
      return { ...ManholeMapAPI.manholeMap2Graphql(json), id };
    }).catch(() => null);
  }

  static nearEntitiesInPoint(point, distance, limit, offset) {
    return this.http({
      url: '/searchbounds',
      params: {
        north: point.lat - distance * this.latKM,
        south: point.lat + distance * this.latKM,
        east: point.lng - distance * this.lngKM,
        west: point.lng + distance * this.lngKM,
        start: offset,
        limit,
      },
    }).then(res => this.res2json(res).map(v => ManholeMapAPI.manholeMap2Graphql(v)));
  }

  static searchEntities(name, limit, offset) {
    return this.http({
      url: '/searchkeyword',
      params: {
        keyword: name,
        start: offset,
        limit,
      },
    }).then(res => this.res2json(res).map(v => ManholeMapAPI.manholeMap2Graphql(v)));
  }
}

export default ManholeMapAPI;
