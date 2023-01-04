export const toRadians = deg => deg * Math.PI / 180;
export const distance = (x1, y1, x2, y2) => Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
export const outOfMapBounds = (x, y, map) => x < 0 || x >= map[0].length || y < 0 || y >= map.length;