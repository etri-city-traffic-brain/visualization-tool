function refine(num) {
  return (num < 10) ? `0${num}` : num;
}

function min2hourstr(minutes) {
  const hours = Math.floor(minutes / 60);
  const min = minutes % 60;
  return `${refine(hours)}:${refine(min)}`;
}

export default min2hourstr;
