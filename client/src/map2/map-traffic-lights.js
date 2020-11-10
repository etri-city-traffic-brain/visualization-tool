// @ts-nocheck
/*!
 * Traffic Light Viewer
 */

import * as R from 'ramda';
import * as maptalks from 'maptalks';

import extent from './map-extent';
// import addLayerTo from './map-add-layer';
import mapService from '../service/map-service';
import makeConnectionManager from '../junction/connection-manager';

const addLayerTo = map => name => new maptalks.VectorLayer(name, [], {}).addTo(map);

export default function SaltTrafficLightsLoader(map, element, events) {
  const addLayer = addLayerTo(map);
  const trafficLightsLayer = addLayer('trafficLightsLayer');

  const getLinkIds = async ({ properties }) => {

    const nodeId = properties.NODE_ID;
    const { features } = await mapService.getLinks(extent(map));
    const filtered = features.filter(
      feature =>
        feature.properties.ED_ND_ID == nodeId ||
        feature.properties.ST_ND_ID == nodeId);

    return filtered.map((feature) => {
      const { properties, geometry } = feature;
      const { ST_ND_ID, ED_ND_ID } = properties;

      if (ED_ND_ID == nodeId) {
        geometry.coordinates[0].reverse();
      }
      // if(properties.LINK_ID[0] !== '-') {
      //   geometry.coordinates[0].reverse();
      // }

      properties.isForward = (ST_ND_ID == nodeId);
      return {
        LINK_ID: properties.LINK_ID,
        LANE: properties.LANE,
        // geometry: geometry.coordinates[0], // from MultiLineString
        geometry: geometry.coordinates, // from MultiLineString
        isForward: properties.isForward || false,
      };
    });
  };

  const editConnection = async (target) => {
    console.log('edit')
    const { owner } = target;
    const [x, y] = owner.toGeoJSONGeometry().coordinates;
    const linkIds = await getLinkIds(target.owner);

    const junction = { id: owner.properties.NODE_ID, x, y };

    console.log(junction)
    console.log(linkIds)
    // const connectionManager = makeConnectionManager(junction, linkIds, element);
    // var modal = document.getElementById('myModal');
    // modal.style.visibility = 'visible';
    events.$emit('junction:selected', {
      junction,
      linkIds,
    });
  };

  const deleteConnection = (target) => {
    const { owner } = target;
    const [x, y] = owner.toGeoJSONGeometry().coordinates;

    const junction = { id: owner.properties.NODE_ID, x, y };

    events.$emit('junction:delete', {
      id: owner.properties.NODE_ID,
      x,
      y
    })
  };


  const clicked = (param) => {

  };

  async function load() {
    if (!trafficLightsLayer.isVisible()) {
      return;
    }
    const { features } = await mapService.getTrafficLights(extent(map));
    trafficLightsLayer.clear();
    const geometries = features.map((feature) => {
      // console.log(feature);
      const options = {
        items: [
          {
            item: `편집 - ${feature.properties.CROSS_NM}`,
            click: editConnection,
          },
          {
            item: `삭제 - ${feature.properties.CROSS_NM}`,
            click: deleteConnection,
          },
        ],
      };

      var geo = new maptalks.Marker(
        feature.geometry.coordinates,
        {
          'symbol' : [
            {
              'markerType': 'ellipse',
              'markerFill': 'blue',
              'markerFillOpacity': 0.6,
              'markerWidth': 15,
              'markerHeight': 15,
              'markerLineWidth': 2
            },
            {
              'markerType': 'ellipse',
              'markerFill': '#1bc8ff',
              'markerFillOpacity': 0.5,
              'markerWidth': 25,
              'markerHeight': 25,
              'markerLineWidth': 0
            },
          ]
        })

        .on('click', clicked)
        .on('mouseenter', function (e) {
          e.target.updateSymbol({
            textName: feature.properties.CROSS_NM,
            textSize: 20,
            markerFillOpacity: 1,
            textFaceName: 'sans-serif',
            textHaloFill: '#fff',
            textHaloRadius: 5,
          });
          e.target.bringToFront()
        }).on('mouseout', function (e) {
          e.target.updateSymbol({
            markerFillOpacity: 0.7,
            textName: ''
          })
        })
        .setMenu(options)
        .openMenu();

      geo.properties = feature.properties

      // const geo = toGeometry(feature)
      //   .on('click', clicked)
      //   .setMenu(options)
      //   .openMenu();
      return geo;
    });
    trafficLightsLayer.addGeometry(geometries);
  }

  const show = () => trafficLightsLayer.show();
  const hide = () => trafficLightsLayer.hide();

  map.on('zoomend moveend', load);

  return {
    load,
    show,
    hide,
  };
}
