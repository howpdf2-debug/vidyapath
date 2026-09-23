import { sanitizeHtml } from './lib/sanitize'

const tests = [
  { name: 'XSS: script', input: '<p>Safe</p><script>alert(1)</script>', no: ['<script', 'alert'], yes: ['Safe'] },
  { name: 'XSS: foreignObject', input: '<svg><foreignObject><script>alert(1)</script></foreignObject></svg>', no: ['foreignObject', '<script', 'alert'], yes: ['<svg'] },
  { name: 'XSS: animate', input: '<svg><animate onbegin="alert(1)" /></svg>', no: ['<animate', 'onbegin', 'alert'] },
  { name: 'XSS: javascript URL', input: '<a href="javascript:alert(1)">Click</a>', no: ['javascript:', 'alert'], yes: ['Click'] },
  { name: 'XSS: encoded js', input: '<a href="&#106;avascript:alert(1)">Click</a>', no: ['alert'] },
  { name: 'XSS: hex encoded js', input: '<a href="&#x6a;avascript:alert(1)">Click</a>', no: ['alert'] },
  { name: 'XSS: onclick', input: '<img src="x.png" onclick="alert(1)">', no: ['onclick'] },
  { name: 'XSS: quote-adjacent onclick', input: '<img src="x.png"onclick="alert(1)">', no: ['onclick'] },
  { name: 'XSS: iframe', input: '<iframe src="https://x.com"></iframe>', no: ['iframe'] },
  { name: 'XSS: srcdoc', input: '<div srcdoc="<script>alert(1)</script>"></div>', no: ['srcdoc', 'script', 'alert'] },
  { name: 'XSS: nested', input: '<scr<script>ipt>alert(1)</script>', no: ['<script', 'alert'] },
  { name: 'XSS: data:text/html', input: '<img src="data:text/html,<script>alert(1)</script>">', no: ['data:text/html', 'alert'] },
  { name: 'XSS: template', input: '<template><script>alert(1)</script></template>', no: ['<template', 'alert'] },
  { name: 'XSS: CDATA', input: '<![CDATA[<script>alert(1)</script>]]>', no: ['<![CDATA[', 'alert'] },
  { name: 'XSS: style tag', input: '<style>body{x:1}</style>', no: ['<style', 'body{'] },

  { name: 'Content: SVG', input: '<svg viewBox="0 0 10 10"><rect fill="#f00"/></svg>', yes: ['<svg', 'viewBox', 'rect', 'fill="#f00"'] },
  { name: 'Content: Hindi', input: '<p>हिंदी टेक्स्ट</p>', yes: ['हिंदी'] },
  { name: 'Content: safe links', input: '<a href="https://x.com">L</a>', yes: ['https://x.com'] },
  { name: 'Content: mailto', input: '<a href="mailto:t@x.com">E</a>', yes: ['mailto:t@x.com'] },
  { name: 'Content: relative', input: '<a href="/path">L</a>', yes: ['href="/path"'] },
  { name: 'Content: table', input: '<table><tr><td>C</td></tr></table>', yes: ['<table', '<td', 'C'] },
  { name: 'Content: inline style', input: '<p style="color:red;">S</p>', yes: ['style="color:red;"'] },

  { name: 'CSS: raw stripped', input: ':root{--bg:red;}\n@media dark{body{color:white}}', no: [':root', '--bg', '@media'] },
  { name: 'CSS: unclosed style', input: '<style>:root{--bg:red}', no: ['<style', ':root', '--bg'] },
] as const

let pass = 0, fail = 0
for (const t of tests) {
  const out = sanitizeHtml(t.input)
  const msgs: string[] = []
  const no = (t as any).no as string[] | undefined
  const yes = (t as any).yes as string[] | undefined
  if (yes) for (const n of yes) if (!out.includes(n)) msgs.push(`MISSING: ${n}`)
  if (no) for (const n of no) if (out.includes(n)) msgs.push(`LEAKED: ${n}`)

  if (msgs.length === 0) {
    pass++
    console.log(`✅ ${t.name}`)
  } else {
    fail++
    console.log(`❌ ${t.name} → ${msgs.join(' | ')}`)
    console.log(`     Output: ${out.slice(0, 120)}`)
  }
}

console.log(`\n═══════════════════════════════════════`)
console.log(`   Total: ${tests.length}   ✅ ${pass}   ❌ ${fail}`)
console.log(`═══════════════════════════════════════`)
if (fail > 0) process.exit(1)
console.log('✅ All tests passed!')