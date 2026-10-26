/* =====================================================================================
 * MC.md — небольшой безопасный Markdown для ответов ИИ-ассистента.
 *
 *   const ast = MC.md.parse(text);      // чистая функция: текст → дерево (тестируется в Node)
 *   const el  = MC.md.render(ast);      // дерево → DOM
 *   const el  = MC.md.toElement(text);  // и то и другое
 *
 * Поддержано: абзацы, заголовки, списки (с вложенностью), цитаты, таблицы, блоки кода ```,
 * строчный код, **жирный**, *курсив*, ссылки (только http/https), формулы $…$, $$…$$,
 * \(…\), \[…\] (KaTeX). Незакрытый блок кода или формула допустимы — текст приходит потоком.
 *
 * Безопасность: ответ модели — недоверенные данные. Разметка строится только через
 * MC.h (textContent), innerHTML не используется; HTML в ответе показывается как текст.
 * ===================================================================================== */
(function (root) {
  'use strict';
  const MC = root.MC || (root.MC = {});

  /* --------------------------------- строчные элементы ---------------------------- */
  const SAFE_URL = /^https?:\/\//i;

  /** Конец формулы, начинающейся в позиции i (после открывающего разделителя), или −1. */
  function findClose(s, from, close) {
    let j = from;
    while (j < s.length) {
      const k = s.indexOf(close, j);
      if (k < 0) return -1;
      if (s[k - 1] === '\\') {
        j = k + 1;
        continue;
      }
      return k;
    }
    return -1;
  }

  function parseInline(s) {
    const out = [];
    let buf = '';
    const flush = () => {
      if (buf) out.push({ t: 'text', v: buf });
      buf = '';
    };
    let i = 0;
    while (i < s.length) {
      const c = s[i];
      // экранирование: \* \_ \$ и т.п.; \( и \[ — разделители формул
      if (c === '\\' && i + 1 < s.length) {
        const n = s[i + 1];
        if (n === '(' || n === '[') {
          const close = n === '(' ? '\\)' : '\\]';
          const k = s.indexOf(close, i + 2);
          if (k > 0) {
            flush();
            out.push({ t: 'math', v: s.slice(i + 2, k).trim(), display: n === '[' });
            i = k + 2;
            continue;
          }
        } else if ('\\`*_{}[]()#+-.!$|~>'.includes(n)) {
          buf += n;
          i += 2;
          continue;
        }
      }
      // строчный код
      if (c === '`') {
        let ticks = 1;
        while (s[i + ticks] === '`') ticks++;
        const fence = '`'.repeat(ticks);
        const k = s.indexOf(fence, i + ticks);
        if (k > 0) {
          flush();
          out.push({ t: 'code', v: s.slice(i + ticks, k).replace(/^ (.*) $/, '$1') });
          i = k + ticks;
          continue;
        }
      }
      // формулы
      if (c === '$') {
        if (s[i + 1] === '$') {
          const k = findClose(s, i + 2, '$$');
          if (k > 0) {
            flush();
            out.push({ t: 'math', v: s.slice(i + 2, k).trim(), display: true });
            i = k + 2;
            continue;
          }
        } else if (s[i + 1] && !/\s/.test(s[i + 1])) {
          const k = findClose(s, i + 1, '$');
          // «$5 и $7» — не формула: перед закрывающим $ не пробел, после него не цифра
          if (k > 0 && !/\s/.test(s[k - 1]) && !/\d/.test(s[k + 1] || '') && !s.slice(i + 1, k).includes('\n\n')) {
            flush();
            out.push({ t: 'math', v: s.slice(i + 1, k), display: false });
            i = k + 1;
            continue;
          }
        }
      }
      // ссылка [текст](url)
      if (c === '[') {
        const m = /^\[([^\]\n]+)\]\(([^)\s]+)\)/.exec(s.slice(i));
        if (m) {
          flush();
          if (SAFE_URL.test(m[2])) out.push({ t: 'link', href: m[2], c: parseInline(m[1]) });
          else out.push(...parseInline(m[1]));
          i += m[0].length;
          continue;
        }
      }
      // жирный и курсив
      if (c === '*' || c === '_') {
        const two = s[i + 1] === c;
        const mark = two ? c + c : c;
        const prev = s[i - 1] || ' ';
        const next = s[i + mark.length] || ' ';
        // «_» внутри слова (snake_case) — не разметка
        const wordy = c === '_' && /[\p{L}\p{N}]/u.test(prev);
        if (!/\s/.test(next) && !wordy) {
          let k = i + mark.length;
          let found = -1;
          while ((k = s.indexOf(mark, k)) > 0) {
            const before = s[k - 1];
            const after = s[k + mark.length] || ' ';
            if (!two && after === c) {
              k += 2; // одиночная звёздочка не закрывается двойной
              continue;
            }
            const ok = !/\s/.test(before) && before !== '\\' && !(c === '_' && /[\p{L}\p{N}]/u.test(after));
            if (ok) {
              found = k;
              break;
            }
            k += mark.length;
          }
          if (found > i + mark.length) {
            flush();
            out.push({ t: two ? 'strong' : 'em', c: parseInline(s.slice(i + mark.length, found)) });
            i = found + mark.length;
            continue;
          }
        }
      }
      if (c === '\n') {
        flush();
        out.push({ t: 'br' });
        i++;
        continue;
      }
      buf += c;
      i++;
    }
    flush();
    return out;
  }

  /* --------------------------------- блоки ---------------------------------------- */
  const RE_FENCE = /^(\s{0,3})(`{3,}|~{3,})\s*([\w+#.-]*)\s*$/;
  const RE_HEAD = /^\s{0,3}(#{1,6})\s+(.*?)\s*#*\s*$/;
  const RE_HR = /^\s{0,3}([-*_])(\s*\1){2,}\s*$/;
  const RE_ITEM = /^(\s*)([-*+•]|\d{1,3}[.)])\s+(.*)$/;
  const RE_QUOTE = /^\s{0,3}>\s?(.*)$/;
  const RE_TABLE_SEP = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;

  const splitRow = (line) => {
    let t = line.trim();
    if (t.startsWith('|')) t = t.slice(1);
    if (t.endsWith('|') && !t.endsWith('\\|')) t = t.slice(0, -1);
    return t.split(/(?<!\\)\|/).map((x) => x.trim().replace(/\\\|/g, '|'));
  };

  function parseBlocks(lines) {
    const out = [];
    let i = 0;
    const isBlank = (l) => !l.trim();
    while (i < lines.length) {
      const line = lines[i];
      if (isBlank(line)) {
        i++;
        continue;
      }
      // блок кода
      let m = RE_FENCE.exec(line);
      if (m) {
        const fence = m[2];
        const body = [];
        i++;
        while (i < lines.length && !(lines[i].trim().startsWith(fence[0].repeat(fence.length)) && /^[`~\s]+$/.test(lines[i]))) body.push(lines[i++]);
        i++; // закрывающая строка (или конец текста — блок ещё пишется)
        out.push({ t: 'codeblock', lang: m[3] || '', v: body.join('\n') });
        continue;
      }
      // выключная формула: $$ … $$ или \[ … \] на отдельных строках
      const tr = line.trim();
      if (tr.startsWith('$$') || tr.startsWith('\\[')) {
        const open = tr.startsWith('$$') ? '$$' : '\\[';
        const close = open === '$$' ? '$$' : '\\]';
        let rest = tr.slice(2);
        const buf = [];
        let closed = false;
        for (;;) {
          const k = rest.indexOf(close);
          if (k >= 0) {
            buf.push(rest.slice(0, k));
            closed = true;
            // хвост после закрывающего разделителя — отдельный абзац
            const tail = rest.slice(k + 2).trim();
            i++;
            if (tail) lines.splice(i, 0, tail);
            break;
          }
          buf.push(rest);
          i++;
          if (i >= lines.length) break;
          rest = lines[i];
        }
        const v = buf.join('\n').trim();
        if (closed) out.push({ t: 'mathblock', v });
        else out.push({ t: 'p', c: [{ t: 'text', v: open + v }] }); // формула ещё не дописана
        continue;
      }
      m = RE_HEAD.exec(line);
      if (m) {
        out.push({ t: 'h', level: m[1].length, c: parseInline(m[2]) });
        i++;
        continue;
      }
      if (RE_HR.test(line) && !RE_ITEM.test(line)) {
        out.push({ t: 'hr' });
        i++;
        continue;
      }
      // таблица: строка с «|» и следом разделитель
      if (line.includes('|') && i + 1 < lines.length && RE_TABLE_SEP.test(lines[i + 1]) && lines[i + 1].includes('-')) {
        const head = splitRow(line);
        const align = splitRow(lines[i + 1]).map((c) => (/^:-+:$/.test(c) ? 'center' : /-+:$/.test(c) ? 'right' : null));
        i += 2;
        const rows = [];
        while (i < lines.length && lines[i].includes('|') && !isBlank(lines[i])) rows.push(splitRow(lines[i++]));
        out.push({ t: 'table', align, head: head.map(parseInline), rows: rows.map((r) => head.map((_, k) => parseInline(r[k] || ''))) });
        continue;
      }
      // цитата
      if (RE_QUOTE.test(line)) {
        const body = [];
        while (i < lines.length && RE_QUOTE.test(lines[i])) body.push(RE_QUOTE.exec(lines[i++])[1]);
        out.push({ t: 'quote', c: parseBlocks(body) });
        continue;
      }
      // список
      m = RE_ITEM.exec(line);
      if (m) {
        const indent = m[1].length;
        const ordered = /\d/.test(m[2]);
        const start = ordered ? parseInt(m[2], 10) : null;
        const items = [];
        while (i < lines.length) {
          const mi = RE_ITEM.exec(lines[i]);
          if (!mi || mi[1].length !== indent || /\d/.test(mi[2]) !== ordered) break;
          const body = [mi[3]];
          i++;
          // продолжение пункта: строки с большим отступом (в т.ч. вложенные списки) и пустые строки между ними
          while (i < lines.length) {
            const l = lines[i];
            if (isBlank(l)) {
              const nx = lines[i + 1];
              if (nx !== undefined && !isBlank(nx) && /^\s+/.exec(nx) && /^\s+/.exec(nx)[0].length > indent) {
                body.push('');
                i++;
                continue;
              }
              break;
            }
            const lead = /^\s*/.exec(l)[0].length;
            if (lead > indent) {
              body.push(l.slice(Math.min(lead, indent + 2)));
              i++;
            } else if (!RE_ITEM.test(l) && !RE_FENCE.test(l) && !RE_HEAD.test(l) && !RE_QUOTE.test(l)) {
              body.push(l.trim()); // «ленивое» продолжение абзаца
              i++;
            } else break;
          }
          items.push(parseBlocks(body));
        }
        out.push({ t: 'list', ordered, start, items });
        continue;
      }
      // абзац
      const para = [line.trim()];
      i++;
      while (i < lines.length && !isBlank(lines[i]) && !RE_FENCE.test(lines[i]) && !RE_HEAD.test(lines[i]) && !RE_ITEM.test(lines[i]) && !RE_QUOTE.test(lines[i]) && !/^\s*(\$\$|\\\[)/.test(lines[i]) &&
        !(lines[i].includes('|') && i + 1 < lines.length && RE_TABLE_SEP.test(lines[i + 1]))) {
        para.push(lines[i].trim());
        i++;
      }
      out.push({ t: 'p', c: parseInline(para.join('\n')) });
    }
    return out;
  }

  function parse(text) {
    return parseBlocks(String(text || '').replace(/\r\n?/g, '\n').replace(/\t/g, '    ').split('\n'));
  }

  /* --------------------------------- дерево → DOM --------------------------------- */
  function tex(src, display) {
    if (MC.math && MC.math.tex) {
      const el = MC.math.tex(src, display);
      if (display) el.classList.add('md-math');
      return el;
    }
    return MC.h('span', { class: 'no-math' }, src);
  }

  function inlineNodes(nodes) {
    const H = MC.h;
    return nodes.map((n) => {
      switch (n.t) {
        case 'text':
          return root.document.createTextNode(n.v);
        case 'code':
          return H('code', null, n.v);
        case 'math':
          return tex(n.v, n.display);
        case 'strong':
          return H('strong', null, inlineNodes(n.c));
        case 'em':
          return H('em', null, inlineNodes(n.c));
        case 'link':
          return H('a', { href: n.href, target: '_blank', rel: 'noopener noreferrer' }, inlineNodes(n.c));
        case 'br':
          return H('br');
        default:
          return null;
      }
    });
  }

  function blockNodes(blocks) {
    const H = MC.h;
    return blocks.map((b) => {
      switch (b.t) {
        case 'p':
          return H('p', null, inlineNodes(b.c));
        case 'h':
          // в узкой панели заголовки ответа — не крупнее h4
          return H('h' + Math.min(6, Math.max(4, b.level + 2)), null, inlineNodes(b.c));
        case 'hr':
          return H('hr');
        case 'codeblock': {
          const code = H('code', b.lang ? { class: 'language-' + b.lang } : null, b.v);
          if (root.hljs && b.lang && root.hljs.getLanguage(b.lang)) {
            try {
              root.hljs.highlightElement(code);
            } catch (e) {
              /* без подсветки */
            }
          }
          return H('pre', null, code);
        }
        case 'mathblock':
          return H('div', { class: 'md-formula' }, tex(b.v, true));
        case 'quote':
          return H('blockquote', null, blockNodes(b.c));
        case 'list': {
          const tight = b.items.every((it) => it.length === 1 && it[0].t === 'p');
          return H(
            b.ordered ? 'ol' : 'ul',
            b.ordered && b.start !== 1 ? { start: b.start } : null,
            b.items.map((it) => H('li', null, tight ? inlineNodes(it[0].c) : blockNodes(it)))
          );
        }
        case 'table':
          return H(
            'div',
            { class: 'md-table' },
            H(
              'table',
              null,
              H('thead', null, H('tr', null, b.head.map((c, k) => H('th', b.align[k] ? { style: { textAlign: b.align[k] } } : null, inlineNodes(c))))),
              H('tbody', null, b.rows.map((r) => H('tr', null, r.map((c, k) => H('td', b.align[k] ? { style: { textAlign: b.align[k] } } : null, inlineNodes(c))))))
            )
          );
        default:
          return null;
      }
    });
  }

  function render(ast) {
    return MC.h('div', { class: 'md no-math' }, blockNodes(ast));
  }

  MC.md = { parse, parseInline, render, toElement: (text) => render(parse(text)) };
})(typeof window !== 'undefined' ? window : globalThis);
