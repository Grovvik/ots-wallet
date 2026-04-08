export const EXPLORER = 'https://ots.su';
export const WS_API = 'wss://api.ots.su'

export function toOts(val) {
    try {
        const isNegative = val < 0n;
        let s = (isNegative ? -val : val).toString();
        
        s = s.padStart(10, '0');
        
        const intPart = s.slice(0, -9);
        let decPart = s.slice(-9).replace(/0+$/, '');
        
        const result = decPart ? `${intPart}.${decPart}` : intPart;
        
        const trimmedResult = result.replace(/^0+(?=\d)/, '');
        
        return isNegative ? `-${trimmedResult}` : trimmedResult;
    } catch (e) {
        console.error(e);
        return '0';
    }
};

export function fetchApi(url, params) {
    return fetch('https://node.ots.su'+url, params);
}

export function serializeWithBigInt(value) {
    return JSON.stringify(value, (_, v) => 
        typeof v === 'bigint' ? { __bigint: true, value: v.toString() } : v
    );
}

export const saveWallets = (wallets) => localStorage.setItem('ots_wallets', JSON.stringify(wallets));
export const loadWallets = () => JSON.parse(localStorage.getItem('ots_wallets'));

export function deserializeWithBigInt(json) {
    if (typeof json === 'string') {
        return JSON.parse(json, (_, v) => 
            v?.__bigint === true ? BigInt(v.value) : v
        );
    }
    return json;
}

export async function sha256(message) {
    const msgUint8 = new TextEncoder().encode(message);                           
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);           
    const hashArray = Array.from(new Uint8Array(hashBuffer));                     
  
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); 
    return hashHex;
};

export function countInstructions(node) {
    if (Array.isArray(node)) {
        const isOpcode = typeof node[0] === 'string';

        let count = isOpcode ? 1 : 0;

        for (const item of node) {
            count += countInstructions(item);
        }
        return count;
    }

    else if (typeof node === 'object' && node !== null) {
        let count = 0;
        for (const key in node) {
            count += countInstructions(node[key]);
        }
        return count;
    }

    return 0;
}

export function decompile(input) {
    let ast;
    if (typeof input === 'string') {
        try { ast = JSON.parse(input); } 
        catch (e) { throw new Error("Invalid JSON input"); }
    } else {
        ast = input;
    }

    const INDENT = '  ';

    function getIndent(level) {
        return INDENT.repeat(level);
    }

    function decompileNode(node, indent = 0) {
        if (node === null) return 'null';
        if (typeof node === 'string') return `"${node.replace(/"/g, '\\"')}"`;
        if (typeof node === 'number' || typeof node === 'boolean') return String(node);
        
        if (typeof node === 'object' && !Array.isArray(node)) {
            if (node.__bigint) return `${node.value}n`;
            
            if (node.raw !== undefined) {
                if (Array.isArray(node.raw)) {
                    return '[' + node.raw.map(n => decompileNode(n, indent)).join(', ') + ']';
                } else {
                    return decompileNode(node.raw, indent);
                }
            }
            if (node.type === 'property') {
                return `${node.key}: ${decompileNode(node.value, indent)}`;
            }
            if (node.type === 'spread') {
                return `...${decompileNode(node.argument, indent)}`;
            }
        }

        if (Array.isArray(node)) {
            if (node.length === 0) return '';
            
            if (Array.isArray(node[0])) {
                return node.map(n => getIndent(indent) + decompileStatement(n, indent)).join('\n');
            }

            const op = node[0];
            const args = node.slice(1);

            switch (op) {
                case 'writeFunc': {
                    const [name, paramsObj, bodyObj] = args;
                    const params = (paramsObj && paramsObj.raw) ? paramsObj.raw.join(', ') : '';
                    return `function ${name}(${params}) {\n${decompileBlock(bodyObj, indent + 1)}\n${getIndent(indent)}}`;
                }
                case 'makeFunc': {
                    const [mParamsObj, mBodyObj] = args;
                    const mParams = (mParamsObj && mParamsObj.raw) ? mParamsObj.raw.join(', ') : '';
                    return `(${mParams}) => {\n${decompileBlock(mBodyObj, indent + 1)}\n${getIndent(indent)}}`;
                }
                case 'writeVar':
                    return `let ${args[0]} = ${decompileNode(args[1], indent)}`;

                case 'readVar':
                    return args[0];

                case 'return':
                    if (args[0] === null || args[0] === undefined) return 'return';
                    return `return ${decompileNode(args[0], indent)}`;

                case 'if': {
                    const condition = decompileNode(args[0], indent);
                    let ifStr = `if (${condition}) {\n${decompileBlock(args[1], indent + 1)}\n${getIndent(indent)}}`;
                    if (args[2]) {
                        ifStr += ` else {\n${decompileBlock(args[2], indent + 1)}\n${getIndent(indent)}}`;
                    }
                    return ifStr;
                }
                case 'while': {
                    const wTest = decompileNode(args[0], indent);
                    return `while (${wTest}) {\n${decompileBlock(args[1], indent + 1)}\n${getIndent(indent)}}`;
                }
                case 'break':
                    return 'break';

                case 'readObjectKey': {
                    const obj = decompileNode(args[0], indent);
                    const keyStr = args[1];
                    if (typeof keyStr === 'string' && /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(keyStr)) {
                        return `${obj}.${keyStr}`;
                    }
                    return `${obj}[${decompileNode(args[1], indent)}]`;
                }
                case 'writeObjectKey': {
                    const wObj = decompileNode(args[0], indent);
                    const wKeyStr = args[1];
                    const wVal = decompileNode(args[2], indent);
                    
                    if (typeof wKeyStr === 'string' && /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(wKeyStr)) {
                        return `${wObj}.${wKeyStr} = ${wVal}`;
                    }
                    return `${wObj}[${decompileNode(args[1], indent)}] = ${wVal}`;
                }
                case 'createObject':
                    return `{ ${(args[0].raw || []).map(p => decompileNode(p, indent)).join(', ')} }`;

                case 'add': return `(${decompileNode(args[0], indent)} + ${decompileNode(args[1], indent)})`;
                case 'sub': return `(${decompileNode(args[0], indent)} - ${decompileNode(args[1], indent)})`;
                case 'mul': return `(${decompileNode(args[0], indent)} * ${decompileNode(args[1], indent)})`;
                case 'div': return `(${decompileNode(args[0], indent)} / ${decompileNode(args[1], indent)})`;
                case 'mod': return `(${decompileNode(args[0], indent)} % ${decompileNode(args[1], indent)})`;
                case 'isEqual': return `(${decompileNode(args[0], indent)} == ${decompileNode(args[1], indent)})`;
                case 'isEqualType': return `(${decompileNode(args[0], indent)} === ${decompileNode(args[1], indent)})`;
                case 'isNotEqual': return `(${decompileNode(args[0], indent)} != ${decompileNode(args[1], indent)})`;
                case 'isNotEqualType': return `(${decompileNode(args[0], indent)} !== ${decompileNode(args[1], indent)})`;
                case 'isGreater': return `(${decompileNode(args[0], indent)} > ${decompileNode(args[1], indent)})`;
                case 'isLower': return `(${decompileNode(args[0], indent)} < ${decompileNode(args[1], indent)})`;
                case 'isEqualGreater': return `(${decompileNode(args[0], indent)} >= ${decompileNode(args[1], indent)})`;
                case 'isEqualLower': return `(${decompileNode(args[0], indent)} <= ${decompileNode(args[1], indent)})`;
                case 'and': return `(${decompileNode(args[0], indent)} && ${decompileNode(args[1], indent)})`;
                case 'or': return `(${decompileNode(args[0], indent)} || ${decompileNode(args[1], indent)})`;
                
                case 'not': return `!${decompileNode(args[0], indent)}`;

                default:
                    return `${op}(${args.map(a => decompileNode(a, indent)).join(', ')})`;
            }
        }
        return '';
    }

    function decompileBlock(blockNode, indent) {
        let stmts = [];
        if (blockNode && blockNode.raw) {
            stmts = blockNode.raw;
        } else if (Array.isArray(blockNode)) {
            stmts = blockNode;
        } else {
            stmts = [blockNode];
        }
        
        return stmts.map(stmt => getIndent(indent) + decompileStatement(stmt, indent)).join('\n');
    }

    function decompileStatement(node, indent) {
        if (!node) return '';
        const stmt = decompileNode(node, indent);
        
        if (Array.isArray(node) && !Array.isArray(node[0])) {
            const op = node[0];
            if (['writeFunc', 'if', 'while'].includes(op)) {
                return stmt;
            }
        }
        return stmt + ';';
    }

    if (Array.isArray(ast) && Array.isArray(ast[0])) {
         return ast.map(n => decompileStatement(n, 0)).join('\n\n');
    } else {
         return decompileStatement(ast, 0);
    }
}
