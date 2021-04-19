import ManhattanRouter from './manhattan-router'
import EasyRouter from './easy-router'
import FreeRouter from './free-router'
import DirectRouter from "./direct-route";
import { $object } from '../util'

const RouterMap = {
  manhattan: ManhattanRouter,
  easy: EasyRouter,
  free: FreeRouter,
  direct: DirectRouter
}

const defaultRouter = FreeRouter

const RouterFactory = {
  create (editPart) {
    let options = editPart.options.get('router')
    let RouterCtr = options
      ? $object.getOrDefault(RouterMap, options.name, defaultRouter)
      : defaultRouter

    return new RouterCtr(editPart)
  },

  DEFAULT: 'free'
}

export default RouterFactory
