(function () {
  function fail(el, text) {
    el.innerHTML = 'Loading fail =('
    console.error(text, el)
  }

  function required(el, field) {
    const val = el.dataset[field]
    if (val) {
      return val
    }
    fail(el, `Missing data-${field} attribut`)
  }

  function h(classes, content, tag = 'div') {
    return `<${tag} class="${classes}">${content}</${tag}>`
  }

  const TIMES = new Map([
    ['second', 1000],
    ['minute', 60],
    ['hour', 60],
    ['day', 24],
    ['month', 30.5],
    ['year', 12],
    ['century', 100]
  ])

  function ago(date) {
    const now = Date.now()
    const target = Number(new Date(date))

    const prefix = target > now ? 'in ' : ''
    const milliseconds = Math.floor(Math.abs(target - now))

    let cur = 0
    let divider = 1
    let name = 'millisecond'
    for (const time of TIMES) {
      divider *= time[1]
      const next = Math.floor(milliseconds / divider)
      if (next <= 0) {
        return `${prefix}${cur} ${name}${cur > 1 ? 's' : ''} ago`
      }
      name = time[0]
      cur = next
    }
    return `${prefix}a long time ago`
  }

  function moji(text, emojis) {
    for (const emoji of emojis) {
      text = text.split(`:${emoji.shortcode}:`).join(
        `<img class="emoji" alt="${emoji.shortcode}" title="${emoji.shortcode}" src="${emoji.static_url}">`
      )
    }
    return text
  }

  function tree(statuses, parent, limit) {
    const [replies, others] = statuses.reduce(([c, o], s) => (s.in_reply_to_id == parent.id ? [[...c, s], o] : [c, [...o, s]]), [[], []])
    parent.replies = limit ? replies.map(r => tree(others, r, limit - 1)) : []
    return parent
  }

  function html(statuses, domain) {
    return statuses.map(({ account, created_at, content, id, emojis, sensitive, spoiler_text, replies }) =>
      h('status', h('date', ago(created_at), 'p') +
        h('author" target="_blank" target="_blank" href="' + account.url, `<img class="avatar" src="${account.avatar_static}" />` +
          h('name', moji(account.display_name, account.emojis), 'span') +
          h('acct', account.acct, 'span'), 'a') +
        (spoiler_text || sensitive ? h('spoiler', spoiler_text || h('spoiler-empty', 'Sensitive', 'span')) : '') +
        h('status-content' + (spoiler_text || sensitive ? ' sensitive' : ''), moji(content, emojis)) +
        (replies ? h('replies', html(replies, domain)) : '') +
        h(`reply" target="_blank" href="https://${domain}/interact/${id}?type=reply`, 'Reply', 'a'))).join('')
  }

  function moderate(statuses, id) {
    if (!id) {
      return statuses
    }
    const valids = statuses.filter(s => s.account.id == id).map(s => s.in_reply_to_id)
    return statuses.filter(s => valids.includes(s.id))
  }

  for (const el of document.getElementsByClassName('comtodon')) {
    el.innerHTML = '<div class="loading">Loading...</div>'

    const domain = required(el, 'domain')
    const status = required(el, 'status')
    if (!domain || !status) {
      return
    }

    fetch(`https://${domain}/api/v1/statuses/${status}/context`)
    .then(res => res.json())
    .then(res => {
      el.innerHTML = h(`reply-main" target=\"_blank\" href="https://${domain}/interact/${status}?type=reply`, 'Comment', 'a')
      const statuses = moderate(res.descendants, el.dataset.moderator)
      if (statuses) {
        el.innerHTML += html('deep' in el.dataset ? tree(statuses, { id: status }, el.dataset.deep || -1).replies : statuses, domain)
      } else {
        el.innerHTML += h('empty', 'Any comment')
      }
      })
      .catch(() => fail(el, 'Request fail'))
  }
})()