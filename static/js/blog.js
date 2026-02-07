// 打印主题标识,请保留出处
(function () {
  const style1 = 'background:#4BB596;color:#ffffff;border-radius: 2px;'
  const style2 = 'color:auto;'
  const author = ' TMaize'
  const github = ' https://github.com/TMaize/tmaize-blog'
  const buildTime = blog.buildAt
  const build = ` ${buildTime.substr(0, 4)}/${buildTime.substr(4, 2)}/${buildTime.substr(6, 2)} ${buildTime.substr(8, 2)}:${buildTime.substr(10, 2)}`
  console.info('%c Author %c' + author, style1, style2)
  console.info('%c Build  %c' + build, style1, style2)
  console.info('%c GitHub %c' + github, style1, style2)
})()

/**
 * 工具，允许多次onload不被覆盖
 * @param {方法} func
 */
blog.addLoadEvent = (func) => {
  const oldonload = window.onload
  if (typeof window.onload !== 'function') {
    window.onload = func
  } else {
    window.onload = () => {
      oldonload()
      func()
    }
  }
}

/**
 * 工具，添加事件监听
 * @param {单个DOM节点} dom
 * @param {事件名} eventName
 * @param {事件方法} func
 * @param {是否捕获} useCapture
 */
blog.addEvent = (dom, eventName, func, useCapture = false) => {
  dom.addEventListener(eventName, func, useCapture)
}

/**
 * 工具，DOM添加某个class
 * @param {单个DOM节点} dom
 * @param {class名} className
 */
blog.addClass = (dom, className) => dom.classList.add(className)

/**
 * 工具，DOM是否有某个class
 * @param {单个DOM节点} dom
 * @param {class名} className
 */
blog.hasClass = (dom, className) => dom.classList.contains(className)

/**
 * 工具，DOM删除某个class
 * @param {单个DOM节点} dom
 * @param {class名} className
 */
blog.removeClass = (dom, className) => dom.classList.remove(className)

/**
 * 工具，转义html字符防止XSS
 * @param {字符串} str
 */
blog.encodeHtml = (str) => {
  const div = document.createElement('div')
  div.innerText = str
  return div.innerHTML
}

/**
 * 工具，转义正则关键字
 * @param {字符串} str
 */
blog.encodeRegChar = (str) => str.replace(/[\\.^$*+?{}\[\]|()]/g, '\\$&')

/**
 * 工具，Fetch API
 * @param {Object} option
 * @param {Function} success
 * @param {Function} fail
 */
blog.ajax = async (option, success, fail) => {
  const { url, method = 'GET', timeout = 10000 } = option
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, {
      method: method.toUpperCase(),
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    
    if (response.ok) {
      const data = await response.text()
      success?.(data)
    } else {
      fail?.({ error: '状态错误', code: response.status })
    }
  } catch (error) {
    clearTimeout(timeoutId)
    fail?.({ error: error.name === 'AbortError' ? '请求超时' : error.message })
  }
}

/**
 * 特效：点击页面文字冒出特效
 */
blog.initClickEffect = (textArr) => {
  const createDOM = (text) => {
    const dom = document.createElement('span')
    dom.innerText = text
    Object.assign(dom.style, {
      left: '0',
      top: '0',
      position: 'fixed',
      fontSize: '12px',
      whiteSpace: 'nowrap',
      webkitUserSelect: 'none',
      userSelect: 'none',
      opacity: '0',
      transform: 'translateY(0)',
      webkitTransform: 'translateY(0)'
    })
    return dom
  }

  blog.addEvent(window, 'click', (ev) => {
    let target = ev.target
    while (target !== document.documentElement) {
      if (target.tagName.toLowerCase() === 'a') return
      if (blog.hasClass(target, 'footer-btn')) return
      target = target.parentNode
    }

    const text = textArr[Math.floor(Math.random() * textArr.length)]
    const dom = createDOM(text)
    document.body.appendChild(dom)
    
    const w = parseInt(window.getComputedStyle(dom, null).width)
    const h = parseInt(window.getComputedStyle(dom, null).height)
    const sh = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
    
    dom.style.left = `${ev.pageX - w / 2}px`
    dom.style.top = `${ev.pageY - sh - h}px`
    dom.style.opacity = '1'

    setTimeout(() => {
      dom.style.transition = 'transform 500ms ease-out, opacity 500ms ease-out'
      dom.style.webkitTransition = 'transform 500ms ease-out, opacity 500ms ease-out'
      dom.style.opacity = '0'
      dom.style.transform = 'translateY(-26px)'
      dom.style.webkitTransform = 'translateY(-26px)'
    }, 20)

    setTimeout(() => {
      document.body.removeChild(dom)
    }, 520)
  })
}

// 新建DIV包裹TABLE
blog.addLoadEvent(() => {
  if (!document.querySelector('.page-post')) return
  
  const tables = document.querySelectorAll('table')
  tables.forEach(table => {
    const elem = document.createElement('div')
    elem.className = 'table-container'
    table.parentNode?.insertBefore(elem, table)
    elem.appendChild(table)
  })
})

// 回到顶部
blog.addLoadEvent(() => {
  const el = document.querySelector('.footer-btn.to-top')
  if (!el) return
  
  const getScrollTop = () => document.documentElement.scrollTop || document.body.scrollTop
  
  const checkToShow = () => {
    getScrollTop() > 200 ? blog.addClass(el, 'show') : blog.removeClass(el, 'show')
  }
  
  blog.addEvent(window, 'scroll', checkToShow)
  blog.addEvent(el, 'click', (event) => {
    window.scrollTo(0, 0)
    event.stopPropagation()
  }, true)
  
  checkToShow()
})

// 点击图片全屏预览
blog.addLoadEvent(() => {
  const postEl = document.querySelector('.page-post')
  if (!postEl) return
  
  console.debug('init post img click event')
  
  let imgMoveOrigin = null
  let restoreLock = false
  const imgArr = document.querySelectorAll('.page-post img')

  const css = `
    .img-move-bg {
      transition: opacity 300ms ease;
      position: fixed;
      left: 0; top: 0; right: 0; bottom: 0;
      opacity: 0;
      background-color: #000000;
      z-index: 100;
    }
    .img-move-item {
      transition: all 300ms ease;
      position: fixed;
      opacity: 0;
      cursor: pointer;
      z-index: 101;
    }
  `
  
  const styleDOM = document.createElement('style')
  styleDOM.textContent = css
  document.head.appendChild(styleDOM)

  window.addEventListener('resize', toCenter)

  imgArr.forEach(img => img.addEventListener('click', imgClickEvent, true))

  const prevent = (ev) => ev.preventDefault()

  function toCenter() {
    if (!imgMoveOrigin) return
    
    let width = Math.min(imgMoveOrigin.naturalWidth, window.innerWidth * 0.9)
    let height = width * imgMoveOrigin.naturalHeight / imgMoveOrigin.naturalWidth
    
    if (window.innerHeight * 0.95 < height) {
      height = Math.min(imgMoveOrigin.naturalHeight, window.innerHeight * 0.95)
      width = height * imgMoveOrigin.naturalWidth / imgMoveOrigin.naturalHeight
    }

    const img = document.querySelector('.img-move-item')
    img.style.left = `${(window.innerWidth - width) / 2}px`
    img.style.top = `${(window.innerHeight - height) / 2}px`
    img.style.width = `${width}px`
    img.style.height = `${height}px`
  }

  function restore() {
    if (restoreLock) return
    restoreLock = true
    
    const div = document.querySelector('.img-move-bg')
    const img = document.querySelector('.img-move-item')

    div.style.opacity = '0'
    img.style.opacity = '0'
    img.style.left = `${imgMoveOrigin.x}px`
    img.style.top = `${imgMoveOrigin.y}px`
    img.style.width = `${imgMoveOrigin.width}px`
    img.style.height = `${imgMoveOrigin.height}px`

    setTimeout(() => {
      restoreLock = false
      document.body.removeChild(div)
      document.body.removeChild(img)
      imgMoveOrigin = null
    }, 300)
  }

  function imgClickEvent(event) {
    imgMoveOrigin = event.target
    const { x, y, width, height, src } = imgMoveOrigin

    const div = document.createElement('div')
    div.className = 'img-move-bg'

    const img = document.createElement('img')
    img.className = 'img-move-item'
    img.src = src
    img.style.left = `${x}px`
    img.style.top = `${y}px`
    img.style.width = `${width}px`
    img.style.height = `${height}px`

    [div, img].forEach(el => {
      el.onclick = restore
      el.onmousewheel = restore
      el.ontouchmove = prevent
    })
    img.ondragstart = prevent

    document.body.appendChild(div)
    document.body.appendChild(img)

    requestAnimationFrame(() => {
      div.style.opacity = '0.5'
      img.style.opacity = '1'
      toCenter()
    })
  }
})

// 切换夜间模式
blog.addLoadEvent(() => {
  const themeBtn = document.querySelector('.footer-btn.theme-toggler')
  const themeIcon = themeBtn.querySelector('.svg-icon')

  blog.removeClass(themeBtn, 'hide')
  if (blog.darkMode) {
    blog.removeClass(themeIcon, 'icon-theme-light')
    blog.addClass(themeIcon, 'icon-theme-dark')
  }

  const updateThemeIcon = (isDark) => {
    blog.removeClass(themeIcon, 'icon-theme-light')
    blog.removeClass(themeIcon, 'icon-theme-dark')
    blog.addClass(themeIcon, isDark ? 'icon-theme-dark' : 'icon-theme-light')
    
    document.documentElement.setAttribute('transition', '')
    setTimeout(() => document.documentElement.removeAttribute('transition'), 600)
    blog.initDarkMode(isDark ? 'true' : 'false')
  }

  blog.addEvent(themeBtn, 'click', () => {
    const flag = blog.darkMode ? 'false' : 'true'
    localStorage.darkMode = flag
    updateThemeIcon(flag === 'true')
  })

  // 检测系统主题明暗丢改变
  window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener?.('change', (ev) => {
    const systemDark = ev.matches
    if (systemDark !== blog.darkMode) {
      localStorage.removeItem('darkMode')
      updateThemeIcon(systemDark)
    }
  })
})

// 标题定位
blog.addLoadEvent(() => {
  const postEl = document.querySelector('.page-post')
  if (!postEl) return
  
  const headings = document.querySelectorAll('.post h1, .post h2')
  headings.forEach(el => {
    blog.addEvent(el, 'click', () => {
      el.scrollIntoView?.({ block: 'start' })
      if (el.id && history.replaceState) {
        history.replaceState({}, '', `#${el.id}`)
      }
    })
  })
})

// 为页面图片启用缘加载
// (下native lazy loading 支持)
blog.addLoadEvent(() => {
  try {
    const imgs = document.querySelectorAll('img')
    imgs.forEach(img => {
      if (!img.hasAttribute('loading')) {
        // 跳过 logo 预载
        if (img.closest?.('.header')?.querySelector?.('.logo')?.contains(img)) return
        img.setAttribute('loading', 'lazy')
      }
    })
  } catch (e) {
    console.warn('init lazy loading images failed', e)
  }
})
