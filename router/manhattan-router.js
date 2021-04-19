import BaseRouter from './base-router'
import EasyRouter from './easy-router'
import {$array, $math} from '../util'

/* Helper Functions */

function getDirectionChange (angle1, angle2) {
  let val = Math.abs(angle1 - angle2)
  return val > 180 ? 360 - val : val
}

function similarity (point, rect, grid, padding) {
  let intersections = Array.of()
  if (rect != null) {
    rect.expand(padding)

    if (rect.contains(point)) {
      let center = rect.center()
      let horizontalIntersections = Array.of()

      let x, y, distanceFromX, distanceFromY

      if (point.vertical(center)) {
        x = rect.x
        horizontalIntersections.push(
            $math.point.of(rect.left(), point.y),
            $math.point.of(rect.right(), point.y)
        )
      } else {
        x = point.isLeft(center) ? rect.left() : rect.right()
        horizontalIntersections.push($math.point.of(x, point.y))
      }

      distanceFromX = Math.abs(point.x - x)
      distanceFromY = Math.abs(point.y - (y = point.isTop(center) ? rect.top() : rect.bottom()))
      distanceFromY >= distanceFromX && (intersections = horizontalIntersections)

      if (distanceFromY <= distanceFromX) {
        point.horizontal(center)
            ? intersections.push($math.point.of(point.x, rect.top()), $math.point.of(point.x, rect.bottom()))
            : intersections.push($math.point.of(point.x, y))
      }
    } else {
      grid.align(point = point.clone())
      intersections.push(point)
    }
  } else {
    intersections.push(point)
  }

  for (let point of intersections) { grid.resize(point) }

  return intersections
}

class Grid {
  constructor (startPoint, endPoint, width, height = width) {
    this.width = width
    this.height = height
    this.anchorPoint = startPoint.clone()

    this.resize(endPoint, width, height)
  }

  align (point) {
    let diff = point.different(this.anchorPoint)

    point.x = this.anchorPoint.x + $math.round(diff.x, this.width)
    point.y = this.anchorPoint.y + $math.round(diff.y, this.height)
  }

  alignTo (point, offsetVector) {
    return point.clone().offset({x: offsetVector.x * this.width, y: offsetVector.y * this.height})
  }

  resize (endPoint) {
    this.width = $math.number.corrected(this.anchorPoint.x - endPoint.x, this.width)
    this.height = $math.number.corrected(this.anchorPoint.y - endPoint.y, this.height)
  }
}

class SortedSet {
  constructor () {
    this.items = []
    this.hash = {}
    this.values = {}
  }

  add (item, value) {
    if (this.hash[item]) {
      // item removal
      $array.remove(this.items, item)
    } else {
      this.hash[item] = SortedSet.OPEN
    }

    this.values[item] = value

    $array.insert(this.items, item, $array.indexOfSorted(this.items, item, (val) => this.values[val] < value))
  }

  remove (item) {
    this.hash[item] = SortedSet.CLOSE
  }

  isOpen (item) {
    return this.hash[item] === SortedSet.OPEN
  }

  isClose (item) {
    return this.hash[item] === SortedSet.CLOSE
  }

  pop () {
    let item = this.items.shift()
    this.remove(item)
    return item
  }

  get isEmpty () {
    return this.items.length === 0
  }
}

SortedSet.OPEN = 1
SortedSet.CLOSE = 2

class Search {
  constructor (targetList, obstacleMap) {
    this.targetList = targetList
    this.obstacleMap = obstacleMap
    this.openSet = new SortedSet()

    this.parents = {}
    this.points = {}
    this.cost = {}
  }

  start (sources) {
    for (let source of sources) {
      this.push(source, null, 0, this.computeDistance(source))
    }
  }

  push (point, parent, cost, distance) {
    let key = point.key

    this.openSet.add(key, distance + cost)
    this.points[key] = point
    this.parents[key] = parent
    this.cost[key] = cost
  }

  pop () {
    return this.points[this.openSet.pop()]
  }

  isEnd () {

  }

  isAccessibleAngle (angle) {
    return isNaN(angle) || this.obstacleMap.getOption('angles').some(a => a === angle)
  }

  isAccessibleEnd (angle, point) {
    return this.endAccessibleFn(angle, point)
  }

  getParent (point) {
    return this.parents[point.key]
  }

  getCost (point) {
    return this.cost[point.key]
  }

  isClose (point) {
    return this.openSet.isClose(point.key)
  }

  isOpen (point) {
    return this.openSet.isOpen(point.key)
  }

  computeDistance (point) {
    // return point.toOthersMinDstance(this.targetList, Point.prototype.manhattanDistanceIgnoreCorner)
  }

  computeCost (point, angle) {
    return this.getCost(point) +
        this.obstacleMap.getOption('penalties')[angle] + this.obstacleMap.getOption('padding')
  }

  getPath (point, start, end) {
    let path = []
    let diff = end.different(point).normalize()

    if (!point.equal(end)) {
      path.unshift(end)
    }

    let currentDiff, parent, current

    parent = this.parents[point.key]
    current = point
    while (parent != null) {
      currentDiff = current.different(parent).normalize()
      if (!currentDiff.equal(diff)) {
        path.unshift(current)
        diff = currentDiff
      }

      current = parent
      parent = this.parents[current.key]
    }

    if (!current.equal(start)) {
      currentDiff = current.different(start).normalize()
      if (!currentDiff.equal(diff)) {
        path.unshift(current)
      }
      path.unshift(start)
    }

    return path
  }
}

class DoubleSearch extends Search {

  constructor (targetList, obstacleMap) {
    super(targetList, obstacleMap)

    this.targetAngle = {}
    this.targetList = $array.ofLimitedBag(obstacleMap.getOption('dynamicTargetCount'), this.targetList)
  }

  search (point, directions, grid) {
    let angle = $math.angle(point.different(this.getParent(point) || this.source))

    for (let direction of directions) {
      this.tryPush(point, angle, direction, grid)
    }
  }

  tryPush (parent, parentAngle, direction, grid) {
    let changeAngle = getDirectionChange(parentAngle, direction.angle)

    if (this.isAccessibleAngle(changeAngle)) {
      let neighborPoint = grid.alignTo(parent, direction)

      if (this.isClose(neighborPoint) || this.obstacleMap.has(neighborPoint)) {
        return
      }

      if (this.isEnd(neighborPoint) && !this.isAccessibleEnd(direction.angle, neighborPoint)) {
        return
      }

      let cost = this.computeCost(parent, changeAngle, direction)
      if (!this.isOpen(neighborPoint) || cost < this.getCost(neighborPoint)) {
        this.push(neighborPoint, parent, cost, this.computeDistance(neighborPoint))
      }
    }
  }

  isEnd (point) {
    return this.opposite.isClose(point)
  }

  isAccessibleEnd (angle, point) {
    let oppositeAngle = $math.angle(point.differentTo(this.opposite.getParent(point)))
    let changeAngle = getDirectionChange(angle, oppositeAngle)

    if (this.isAccessibleAngle(changeAngle)) {
      this.targetAngle[point.key] = changeAngle
      return true
    }

    return false
  }

  computeDistance (point) {
    if (this.isEnd(point)) {
      return this.opposite.getCost(point) + this.obstacleMap.getOption('penalties')[this.targetAngle[point.key]]
    }

    let min = Infinity
    for (let target of this.targetList) {
      min = Math.min(min, point.distanceOfSqrt(target, true) + this.opposite.getCost(target))
    }

    return min
  }

  computeCost (point, angle, direction) {
    return this.getCost(point) +
        this.obstacleMap.getOption('penalties')[angle] + direction.cost
  }

  reverse (sourceList) {
    let search = new DoubleSearch(sourceList, this.obstacleMap)

    this.opposite = search
    search.opposite = this

    for (let source of sourceList) {
      this.cost[source.key] = 0
    }

    for (let target of this.targetList) {
      search.cost[target.key] = 0
    }

    return search
  }

  pop () {
    let point = super.pop()

    // this.opposite.targetList.$push(point)

    return point
  }

  getPath (point, start, end) {
    let forward = super.getPath(point, start, point)
    let backward = super.getPath.call(this.opposite, point, end, point)

    backward.pop()

    $array.append(forward, backward.reverse())

    return forward
  }
}

/**
 * double search, search result more symmetryer than solo
 */
function doubleSearch (sourceRect, targetRect, startPoint, endPoint, obstacleMap) {
  // compute adp grid by padding
  let padding = obstacleMap.getOption('padding')

  let grid = new Grid(startPoint, endPoint, padding)

  let pointsOfStartable = similarity(startPoint, sourceRect, grid, padding)
  let pointOfEndable = similarity(endPoint, targetRect, grid, padding)

  let Positive = new DoubleSearch(pointOfEndable, obstacleMap)
  let Negative = Positive.reverse(pointsOfStartable)

  Positive.start(pointsOfStartable)
  Negative.start(pointOfEndable)

  Positive.source = startPoint
  Negative.source = endPoint

  let directions = obstacleMap.getOption('directions')
  let loops = 1000

  while (!Positive.openSet.isEmpty && !Negative.openSet.isEmpty && loops > 0) {
    let positiveCurrent = Positive.pop()
    let negativeCurrent = Negative.pop()

    if (Positive.isEnd(positiveCurrent)) {
      return Positive.getPath(positiveCurrent, startPoint, endPoint)
    }

    if (Negative.isEnd(negativeCurrent)) {
      return Positive.getPath(negativeCurrent, startPoint, endPoint)
    }

    Positive.search(positiveCurrent, directions, grid)
    Negative.targetList.$push(positiveCurrent)

    Negative.search(negativeCurrent, directions, grid)
    Positive.targetList.$push(negativeCurrent)

    loops--
  }

  // TODO
  // return opt.failureRoute.call(line)
}

export default class ManhattanRouter extends BaseRouter {
  route (editPart) {
    let sourceRect = this.getSource()
    let targetRect = this.getTarget()
    let startPoint = this.getStart()
    let endPoint = this.getEnd()

    if (targetRect == null) {
      return EasyRouter.prototype.route(this)
    }

    editPart.compositeTarget.emit('obstacle:build', obstacleMap => {
      try {
        // this.setPath(doubleSearch(sourceRect, targetRect, startPoint, endPoint, obstacleMap)) // TODO
        doubleSearch(sourceRect, targetRect, startPoint, endPoint, obstacleMap)
      } catch (e) {
        console.log(e)
        EasyRouter.prototype.route(this)
      }
    })
  }
}
