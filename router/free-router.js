/*  */
import BaseRouter from './base-router'
import {$math} from '../util'

export default class FreeRouter extends BaseRouter {
  route () {
    let editPart = this.editPart
    let sourceRect = this.getSource(editPart)
    let targetRect = this.getTarget(editPart)
    let startPoint = this.getStart(editPart)
    let endPoint = this.getEnd(editPart)

    let startSimlarity = similarity(startPoint, sourceRect, 10)[0]
    let endSimlarity = similarity(endPoint, targetRect, 10)[0]

    let headVerctor = Vector.ofTargeted(startPoint, startSimlarity)
    let tailVerctor = Vector.ofTargeted(endSimlarity, endPoint)

    headVerctor.next = tailVerctor

    try {
      headVerctor.build(new Grid(startSimlarity, endSimlarity, sourceRect, targetRect))
    } catch (e) {
      Exception.error(e, startPoint, endPoint, sourceRect, targetRect)
    }

    this.setPath(headVerctor.get())
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

  build (grid) {
    this.grid = grid // TODO
    if (this.walkForward()) {
      return this.isFixed ? this.tryConnect() : this.split(this.to, this.direction)
    }
  }

  tryConnect () {
    if (this.next) {
      return this.next.fixed.original() ? this.connectWhenOriginal() : this.connectWithNext()
    }
  }

  connectWhenOriginal () {
    let next = this.next
    let diff = next.to.different(this.to)

    this.next = next.next

    if (diff.original() || fixed(this.direction, diff)) {
      this.to = next.to
      return this.tryConnect()
    }

    return this.split(next.to, diff).build(this.grid)
  }

  connectWithNext () {
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

    return next && next.build(this.grid)
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
      // prevCosine === 0 && grid.offset(from, prevDirection)
      prevCosine === 0 && this.grid.offset(from, prevDirection)
    } else
    // →  ↑  ←
    // → → ← ←
    if (prevCosine >= 0) { // connected
      prev.to = corner(from, to, prevDirection)
      next.from = prev.to.clone()

      return next
    }

    // ←  ↑  →
    /* // eslint-disable-next-line no-return-assign
    return this.join(from, to = from.clone(), grid.turnAndOffset(to, prevDirection, connectDirection)) */
    let turned = turn(prevDirection, connectDirection)
    let newTo = from.clone()
    this.grid.turnAndOffset(newTo, to, turned)
    return this.join(from, newTo, turned)
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
        let split = from.clone()

        this.grid.offset(split, turned)
        return this.join(from, split, turned).join(split, to, prevDirection.clone().opposite())
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
        prev.to = next.to
        return (prev.next = next.next)
      }

      // ↓
      // ↑
      // ↑ next
      // ↓
      // grid.offset(from = from.clone(), turned)
      this.grid.offset(to = from.clone(), turned)
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
        to = nextCosine > 0 ? corner(from, to, turned) : this.grid.offsetOrHalf(from, to, turned, prevDirection) // halfCorner(from, to, turned)
      } else {
        from = prev.to =
            nextCosine > 0
                //   ↑
                // ↑
                ? halfCorner(from, to, prevDirection)
                // ↓
                //   ↑
                : corner(from, to, prevDirection)
      }
    }

    return this.join(from, to, turned)
  }

  split (to, direction) {
    let from = this.from
    let split

    let cosine = $math.dotProduct(this.fixed, direction)

    direction = turn(this.fixed, direction)

    if (cosine > 0) {
      split = corner(from, to, this.fixed)

      this.to = split
      this.direction = split.different(from)

      return this.join(split, to, direction)
    }

    if (cosine === 0) {
      return this.join(this.to, to, direction)
    }

    this.grid.offset(split = this.to.clone(), direction)

    return this.join(this.to, split, direction).join(split, to, this.fixed.clone().opposite())
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

class Grid {
  constructor (from, to, fromRect, toRect) {
    this.rect = $math.rect.of(
        Math.min(from.x, to.x),
        Math.max(from.x, to.x),
        Math.min(from.y, to.y),
        Math.max(from.y, to.y)
    )

    this.center = this.rect.union(fromRect).union(toRect).center()
    this.intersect = fromRect ? fromRect.different(toRect) : $math.rect.of(0, 0, 0, 0)
    this.fromRect = fromRect
    this.toRect = toRect
  }

  isContains (point) {
    if (this.fromRect && this.fromRect.within(point)) return true
    if (this.toRect && this.toRect.within(point)) return true
    return false
  }

  offset (point, expect) {
    if (orthogonal(expect)) {
      if (expect.x === 0) {
        point.y = expect.y > 0 ? this.rect.bottom() : this.rect.top()
      } else {
        point.x = expect.x > 0 ? this.rect.right() : this.rect.left()
      }
    }
  }

  turnAndOffset (from, to, expect) {
    this.rect.within(to) && this.offset(from, expect)
  }

  offsetOrHalf (from, to, halfDirection, direction) {
    this.isContains(from) && this.offset(from, direction)

    let point
    if ((halfDirection.x === 0 && this.intersect.height > 0) ||
        (halfDirection.y === 0 && this.intersect.width > 0)) {
      point = this.intersect.center()

      halfDirection.x === 0 && (point.x = from.x)
      halfDirection.y === 0 && (point.y = from.y)
    } else {
      this.offset(point = from.clone(), halfDirection.opposite())
    }

    return point
  }
}

// For test
export const route = FreeRouter.prototype.route
