// 解析 html 标签, 生成 AST

export function _parseHTML (html) {
    html = html || '';
    var unicodeRegExp = /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/;
    var attribute = /^\s*([^\s"'<>/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
    var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z" + (unicodeRegExp.source) + "]*";
    var qnameCapture = "((?:" + ncname + "\\:)?" + ncname + ")";
    var startTagOpen = new RegExp(("^<" + qnameCapture));
    var startTagClose = /^\s*(\/?)>/;
    var endTag = new RegExp(("^<\\/" + qnameCapture + "[^>]*>"));

    var i = 0;
    var ret = [];
    var stack = [];
    while ((html = html.trim()) && i++ < 100) {
        let m = html.match(startTagOpen)
        if (m) {
            let t = {
                tag: m[1],
                attr: [],
                attrMap: {},
                children: []
            }
            stack.push(t)
            html = html.substring(m[0].length);
            var end, attr;
            while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
                t.attr.push({
                    key: attr[1],
                    value: attr[3]
                })
                t.attrMap[attr[1]] = attr[3];
                html = html.substring(attr[0].length);
            }
            if (end) {
                html = html.substring(end[0].length);
                if (end[0] === '/>') {
                    if (stack.length > 1) {
                        stack[stack.length - 1].children.push(stack.pop());
                    } else {
                        ret.push(stack.pop())
                    }
                }
            }
        } else if (html.match(endTag)) {
            m = html.match(endTag)
            html = html.substring(m[0].length)
            if (stack.length > 1) {
                stack[stack.length - 1].children.push(stack.pop());
            } else {
                ret.push(stack.pop())
            }
        } else {
            let endIndex = html.indexOf('<');
            html = html.substring(endIndex);
        }
    }
    return ret;
}
