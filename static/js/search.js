// 加载所有文章数据，优先使用localStorage缓存
const loadAllPostData = async (callback) => {
  try {
    const loadingEl = document.querySelector('.page-search .icon-loading')
    
    if (localStorage.db && localStorage.dbVersion === blog.buildAt) {
      if (loadingEl) loadingEl.style.opacity = '0'
      callback?.(localStorage.db)
      return
    }

    localStorage.removeItem('dbVersion')
    localStorage.removeItem('db')

    const response = await fetch(`${blog.baseurl}/static/xml/search.xml?t=${blog.buildAt}`)
    const data = await response.text()
    
    if (loadingEl) loadingEl.style.opacity = '0'
    localStorage.db = data
    localStorage.dbVersion = blog.buildAt
    callback?.(data)
  } catch (error) {
    console.error('全文检索数据加载失败...', error)
    callback?.(null)
  }
}

// 搜索功能
blog.addLoadEvent(async () => {
  const input = document.getElementById('search-input')
  if (!input) return

  let titles = []
  let contents = []
  let inputLock = false

  const parseTitle = () => Array.from(document.querySelectorAll('.list-search .title'), el => el.innerHTML)

  const parseContent = (data) => {
    const root = document.createElement('div')
    root.innerHTML = data
    return Array.from(root.querySelectorAll('li'), el => el.innerHTML)
  }

  const highlightText = (text, keyword, start, end) => {
    const before = text.substring(0, start)
    const highlight = text.substring(start, end)
    const after = text.substring(end)
    return `${before}<span class="hint">${highlight}</span>${after}`
  }

  const search = (key) => {
    key = key.trim()
    key = key.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

    const doms = document.querySelectorAll('.list-search li')
    const keyLower = key.toLowerCase()

    doms.forEach((dom_li, i) => {
      const title = titles[i]
      const content = contents[i]
      const dom_title = dom_li.querySelector('.title')
      const dom_content = dom_li.querySelector('.content')

      dom_title.innerHTML = title
      dom_content.innerHTML = ''

      if (!key) {
        dom_li.hidden = true
        return
      }

      let hide = true
      const idx1 = title.toLowerCase().indexOf(keyLower)
      
      if (idx1 !== -1) {
        hide = false
        dom_title.innerHTML = highlightText(title, key, idx1, idx1 + key.length)
      }

      const idx2 = content.toLowerCase().indexOf(keyLower)
      if (idx2 !== -1) {
        hide = false
        const left = Math.max(idx2 - 20, 0)
        const right = Math.min(left + Math.max(key.length, 100), content.length)
        const newContent = content.substring(left, right)
        const idx = newContent.toLowerCase().indexOf(keyLower)
        dom_content.innerHTML = highlightText(newContent, key, idx, idx + key.length) + '...'
      } else if (idx1 !== -1) {
        dom_content.innerHTML = content.substring(0, 100) + '...'
      }

      dom_li.hidden = hide
    })
  }

  // 等待数据加载
  await new Promise(resolve => loadAllPostData(data => {
    if (data) {
      titles = parseTitle()
      contents = parseContent(data)
    }
    resolve()
  }))

  search(input.value)

  blog.addEvent(input, 'input', (event) => {
    if (!inputLock) search(event.target.value)
  })

  blog.addEvent(input, 'compositionstart', () => {
    inputLock = true
  })

  blog.addEvent(input, 'compositionend', (event) => {
    inputLock = false
    search(event.target.value)
  })
})
