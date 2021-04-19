import BaseRouter from './base-router'
import {$math} from '../util'

export default class EasyRouter extends BaseRouter {
  route (editPart) {
    let start = this.getStart(editPart)
    let end = this.getEnd(editPart)

    let path

    try {
      let half = (start.y + end.y) / 2
      path = [start, {x: start.x, y: half}, {x: end.x, y: half}, end]
    } catch (e) {
      path = [start, end]
    }

    this.setPath(editPart, path)
  }
}

function similarity (point, rect, padding) {
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
      intersections.push(point.clone())
    }
  } else {
    intersections.push(point.clone())
  }

  return intersections
}

const grid = {
  width: 10,
  height: 10,
  turnAndOffset (point, turned, direction) {
    direction = turn(turned, direction)

    this.offset(point, direction)

    return direction
  },
  offset (point, direction) {
    direction.normalize()
    point.x += direction.x * this.width
    point.y += direction.y * this.height
  },
  offsetUnto (point, direction, unto) {
    if (fixed(unto.different(point), direction)) {
      this.offset(point, direction)

      return fixed(unto.different(point), direction) ? point : unto.clone()
    }

    return false
  }
}

const Exception = {
  error (e, start, end, source, target) {
    console.error(
        `The failure: 
          start: ${start.toString()},
          end: ${end.toString()},
          source: ${source ? source.toString() : 'none'},
          target: ${target ? target.toString() : 'none'}
        `
    )
    throw e
  },
  throw (message) {
    throw Error(message)
  }
}

function like (value1, value2) {
  return (value1 === 0 && value2 === 0) || value2 * value1 > 0
}

function orthogonal (direction) {
  return direction.x * direction.y === 0 && direction.x + direction.y !== 0
}

function fixed (fixedDirection, direction) {
  return like(direction.x, fixedDirection.x) && like(direction.y, fixedDirection.y)
}

function turn (turned, direction) {
  direction = direction.clone()
  if (turned.x === 0) {
    direction.y = 0
    direction.x = direction.x || (Math.round(Math.random() * 100) % 2 === 0 ? 1 : -1)
  } else {
    direction.x = 0
    direction.y = direction.y || (Math.round(Math.random() * 100) % 2 === 0 ? 1 : -1)
  }

  direction.original() && Exception.throw(`Turned direction is invalid: ${turned.toString()}`)

  return direction
}

function corner (p1, p2, direction) {
  return direction.x === 0 ? $math.point.of(p1.x, p2.y) : $math.point.of(p2.x, p1.y)
}

function halfCorner (p1, p2, direction) {
  return direction.x === 0 ? $math.point.of(p1.x, $math.precise((p1.y + p2.y) / 2)) : $math.point.of($math.precise((p1.x + p2.x) / 2), p1.y)
}

function freeFixed (fixed) {
  if (fixed.x * fixed.y !== 0) {
    if (Math.round(Math.random() * 100) % 2 === 0) {
      fixed.x = 0
    } else {
      fixed.y = 0
    }
  }
}

function freeDirection () {
  return $math.point.of(
      Math.round(Math.random() * 100) % 2 === 0 ? 1 : -1,
      Math.round(Math.random() * 100) % 2 === 0 ? 1 : -1
  )
}

class Vector {
  static ofTargeted (from, to) {
    let fixed = to.different(from) // TODO

    freeFixed(fixed)

    return new Vector(from, to, fixed)
  }

  static isVertical (direction1, direction2) {
    return $math.dotProduct(direction1, direction2) === 0
  }

  constructor (from, to, fixed) {
    this.from = from
    this.to = to

    // 固定方向
    this.fixed = fixed

    // 当前方向向量
    this.direction = to.different(from)

    // 是否已经对齐
    this.isOrthogonal = false

    // 是否已经处在固定的方向上
    this.isFixed = false
  }

  build (obstacleMap, built) {
    // TODO
    this.obstacleMap = obstacleMap
    if (this.walkForward()) {
      return this.isFixed ? this.tryConnect(obstacleMap, built) : this.split(this.to, this.direction, obstacleMap)
    }
  }

  tryConnect (obstacleMap, built) {
    if (this.next) {
      return this.next.fixed.original() ? this.connectWhenOriginal(obstacleMap) : this.connectWithNext(obstacleMap, built)
    } else {

    }
  }

  connectWhenOriginal (obstacleMap) {
    let next = this.next
    let diff = next.to.different(this.to)

    this.next = next.next

    if (diff.original() || fixed(this.direction, diff)) {
      this.to = next.to
      return this.tryConnect(obstacleMap)
    }

    return this.split(next.to, diff, obstacleMap)
  }

  connectWithNext (obstacleMap, built) {
    let prev = this
    let next = this.next

    let from = prev.to
    let to = next.from

    let prevDirection = prev.fixed
    let nextDirection = next.fixed
    let direction = to.different(from)

    let prevCosine = $math.dotProduct(direction, prevDirection)
    let nextCosine = $math.dotProduct(direction, nextDirection)

    next = Vector.isVertical(prevDirection, nextDirection)
        ? this.verticalConnect(from, to, prev, next, prevDirection, nextDirection, prevCosine, nextCosine, direction)
        : this.horizontalConnect(from, to, prev, next, prevDirection, nextDirection, prevCosine, nextCosine, direction)

    return next && next.build(obstacleMap)
  }

  verticalConnect (
      from,
      to,
      prev,
      next,
      prevDirection,
      nextDirection,
      prevCosine,
      nextCosine,
      connectDirection
  ) {
    // → ← → ← → ←
    //      ↑
    if (nextCosine < 0) {
      // → ←
      //  ↑
      prevCosine === 0 && grid.offset(from, prevDirection)
    } else
    // →  ↑  ←
    // → → ← ←
    if (prevCosine >= 0) { // connected
      prev.to = corner(from, to, prevDirection)
      next.from = prev.to.clone()

      return next
    }

    // ←  ↑  →
    // eslint-disable-next-line no-return-assign
    return this.join(from, to = from.clone(), grid.turnAndOffset(to, prevDirection, connectDirection))
  }

  horizontalConnect (
      from,
      to,
      prev,
      next,
      prevDirection,
      nextDirection,
      prevCosine,
      nextCosine,
      connectDirection
  ) {
    let turned = turn(prevDirection, connectDirection)

    // ↓
    // ↑
    // ↑ next
    // ↓
    // ↑

    //  ↓↑ next
    //  ↑
    if (connectDirection.original()) {
      if (fixed(prevDirection, nextDirection)) {
        prev.to = next.to
        return (prev.next = next.next)
      } else {
        // Exception.throw('Infinity')
        return this.joinZero(from, turned)
      }
    }

    // ↓
    // ↑
    // ↑ next
    // ↓
    // ↑
    if (orthogonal(connectDirection) && prevCosine !== 0) {
      // ↑ next
      // ↑
      if (prevCosine > 0 && nextCosine > 0) {
        let $to = this.findUnto(this.from, this.next.from, this.obstacleMap)
        // prev.to = next.to

        if ($to.equal(to)) {
          prev.to = next.to
          return (prev.next = next.next)
        } else {
          from = prev.to = $to
          return this.join(from, to, turned)
        }

        // return (prev.next = next.next)
      }

      // ↓
      // ↑
      // ↑ next
      // ↓
      grid.offset(from = from.clone(), turned)
    } else {
      // ↓   ↓
      // ↑   ↑
      //   ↑
      // ↓   ↓
      // ↑   ↑

      // ↑
      //   ↑
      // ↓
      if (prevCosine < 0) {
        //                     ↑                         ↑ ↑
        //                    ↓ ↓                         ↑
        to = nextCosine > 0 ? corner(from, to, turned) : halfCorner(from, to, turned)
      } else {
        from = prev.to =
            nextCosine > 0
                // ↓
                //   ↑
                ? halfCorner(from, to, prevDirection)
                //   ↑
                // ↑
                : corner(from, to, prevDirection)
      }
    }

    return this.join(from, to, turned)
  }

  split (to, direction, obstacleMap) {
    let from = this.from
    let split

    let cosine = $math.dotProduct(this.fixed, direction)
    if (cosine > 0) {
      split = corner(from, to, this.fixed)
    } else {
      grid.offset(split = from.clone(), this.fixed)
    }

    this.to = split
    this.direction = split.different(from)

    return this.join(split, to, turn(this.direction, direction)).build(obstacleMap) // TODO
  }

  join (from, to, fixed) {
    let vector = new Vector(from.clone(), to.clone(), fixed)

    vector.next = this.next

    return (this.next = vector)
  }

  joinZero (from, fixed) {
    let zero = new InfinityToZeroVector(from.clone(), fixed)

    zero.next = this.next

    return (this.next = zero)
  }

  walkForward () {
    let direction = this.direction

    let original
    if ((original = direction.original())) {
      let next = this.next
      let to = this.to

      while (next != null) {
        direction = next.from.different(this.to)
        if (!(original = direction.original())) {
          to = next.from
          next.direction.original() && (next = next.next)
          break
        }

        direction = next.direction
        if (!(original = direction.original())) {
          to = next.to
          next = next.next
          break
        }

        next = next.next
      }

      this.to = to
      this.next = next
      this.direction = direction.clone()
      this.fixed.original() && freeFixed(this.fixed = direction.clone())
    }

    this.isOrthogonal = orthogonal(this.direction)
    this.isFixed = this.isOrthogonal && fixed(this.fixed, this.direction)

    return !original
  }

  isAccessible () {
    return this.isOrthogonal
  }

  get () {
    let path = Array.of(this.from)
    let next = this

    while (next) {
      next.appendTo(path)
      next = next.next
    }

    return path
  }

  appendTo (path) {
    path.push(this.to)
  }

  findUnto (from, to, obstacleMap) {
    let current = from.clone()

    do {
      if (!grid.offsetUnto(current, this.direction, to)) {
        return current
      }
    } while (obstacleMap.has(current))

    let firstNotObstacle = current.clone() // current is first point that not on the obstacle

    do {
      if (!grid.offsetUnto(current, this.direction, to)) {
        return to
      }
    } while (!obstacleMap.has(current))

    return firstNotObstacle
  }
}

class InfinityToZeroVector extends Vector {
  constructor (from, fixed) {
    super(from, from.clone(), fixed)

    this.direction = fixed.clone()
    this.isOrthogonal = true
    this.isFixed = true
  }

  walkForward () {
    return true
  }

  appendTo (path) {
    // path.push(this.to.clone().offset({x: $math.InfinityToZero, y: $math.InfinityToZero}))
  }
}

export function route (editPart, obstacleMap) {
  let sourceRect = this.getSource(editPart)
  let targetRect = this.getTarget(editPart)
  let startPoint = this.getStart(editPart)
  let endPoint = this.getEnd(editPart)

  let headVerctor = Vector.ofTargeted(startPoint, similarity(startPoint, sourceRect, 10)[0])
  let tailVerctor = Vector.ofTargeted(similarity(endPoint, targetRect, 10)[0], endPoint)

  headVerctor.next = tailVerctor

  try {
    headVerctor.build(obstacleMap)
  } catch (e) {
    Exception.error(e, startPoint, endPoint, sourceRect, targetRect)
  }

  return headVerctor.get()
}
