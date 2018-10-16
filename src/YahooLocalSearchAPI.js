import axios from 'axios';

class YahooLocalSearchAPI {
  static get http() {
    if (!this.$http) {
      this.$http = axios.create({
        baseURL: 'https://map.yahooapis.jp',
        url: '/search/local/V1/localSearch',
        params: {
          appid: process.env.YAHOO_APP_ID,
          device: 'mobile',
          sort: 'dist',
          output: 'json',
          image: true,
        },
      });
    }
    return this.$http;
  }

  static api2GraphQL(feature) {
    const geo = feature.Geometry.Coordinates;
    const sep = geo.indexOf(',');
    return {
      categoryId: feature.Property.CassetteId,
      id: feature.Id,
      name: feature.Name,
      desc: feature.Property.CatchCopy,
      picture: feature.Property.LeadImage,
      geo: {
        lat: Number(geo.substring(sep + 1)),
        lng: Number(geo.substring(0, sep)),
      },
    };
  }

  static entity(categoryId, id) {
    return this.http({
      params: {
        cid: categoryId,
        id,
      },
    }).then((res) => {
      if ((res.data.Feature || []).length !== 1) return null;
      return this.api2GraphQL(res.data.Feature[0]);
    });
  }

  static nearEntitiesInPoint(point, distance, limit, offset) {
    return this.http({
      params: {
        lat: point.lat,
        lon: point.lng,
        dist: distance,
        start: offset,
        result: limit,
      },
    }).then(res => (res.data.Feature || []).map(this.api2GraphQL));
  }

  static searchEntities(name, limit, offset) {
    return this.http({
      params: {
        query: name,
        start: offset,
        result: limit,
      },
    }).then(res => (res.data.Feature || []).map(this.api2GraphQL));
  }
}

export default YahooLocalSearchAPI;
