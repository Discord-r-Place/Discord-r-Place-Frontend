function diffPoints(p1: Point, p2: Point) {
  return { x: p1.x - p2.x, y: p1.y - p2.y }
}

function addPoints(p1: Point, p2: Point) {
  return { x: p1.x + p2.x, y: p1.y + p2.y }
}

function scalePoint(p1: Point, scale: number) {
  return { x: p1.x / scale, y: p1.y / scale }
}

export { diffPoints, addPoints, scalePoint }
