
export default ({properties = {}}) => {
  const { LINK_ID, LANE_ID, SECTION_ID } = properties;
  if (properties.hasOwnProperty('LANE_ID')) {
    return `${LINK_ID}_${SECTION_ID}_${LANE_ID}`;
  }
  return `${LINK_ID}`;
};
