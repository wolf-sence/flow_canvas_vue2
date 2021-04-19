import BaseRouter from './base-router'

export default class EasyRouter extends BaseRouter {
  route () {
    let editPart = this.editPart
    let start = this.getStart(editPart)
    let end = this.getEnd(editPart)

    let path

    try {
      let half = (start.y + end.y) / 2
      path = [start, {x: start.x, y: half}, {x: end.x, y: half}, end]
    } catch (e) {
      path = [start, end]
    }

    this.setPath(path)
  }
}
