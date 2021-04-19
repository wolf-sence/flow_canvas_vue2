import {$math} from '../util'

const defaults = {
  targetType: 'node',
  sourceType: 'node'
}

export default class BaseRouter {

  constructor (editPart, feature) {
    if (!editPart.compositeTarget) {
      throw Error() // TODO
    }

    this.feature = feature || defaults
    this.editPart = editPart
  }

  getPath () {
    return this.editPart.get('connection.path')
  }

  setPath (path) {
    this.editPart.set('connection.path', path)
  }

  getSource () {
    let source = this.editPart
        .compositedSiblings(this.editPart.get('connection.source'), this.feature.sourceType)

    return $math.rect.of(source ? source.styleTarget.getBBox() : null)
  }

  getTarget () {
    let target = this.editPart
        .compositedSiblings(this.editPart.get('connection.target'), this.feature.targetType)

    return $math.rect.of(target ? target.styleTarget.getBBox() : null)
  }

  getStart () {
    return $math.point.of(this.editPart.get('connection.start'))
  }

  getEnd () {
    return $math.point.of(this.editPart.get('connection.end'))
  }

  dispose () {
    this.editPart = null
  }

  route () {}
}
