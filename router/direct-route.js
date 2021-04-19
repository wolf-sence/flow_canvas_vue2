import BaseRouter from './base-router'

export default class DirectRouter extends BaseRouter {
  route () {
    let editPart = this.editPart
    let start = this.getStart(editPart)
    let end = this.getEnd(editPart)

    this.setPath([start, end])
  }
}