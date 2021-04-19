import Aditor from 'toy-widget'

export function createElement (tagName) {
  return document.createElementNS('http://www.w3.org/2000/svg', tagName)
}

export const $fn = Aditor.utils.$fn

export const $object = Aditor.utils.$object

export const $array = Aditor.utils.$array

export const $string = Aditor.utils.$string

export const $window = Aditor.utils.$window

export const $math = Aditor.utils.$math
