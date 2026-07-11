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
  if (document.readyState !== 'loading') {
    func()
  } else {
    document.addEventListener('DOMContentLoaded', func, { once: true })
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
 * 特效：点击页面文字冒出特效
 */
blog.initClickEffect = (textArr) => {
  if (!textArr?.length) return
  
  const ANIMATION_DURATION = 500
  const ANIMATION_DELAY = 20
  const createDOM = (text) => {
    const dom = document.createElement('span')
    dom.innerText = text
    dom.style.cssText = `
      left: 0; top: 0;
      position: fixed;
      font-size: 12px;
      white-space: nowrap;
      user-select: none;
      opacity: 0;
      transform: translateY(0);
      pointer-events: none;
    `
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
    
    const rect = dom.getBoundingClientRect()
    const w = Math.round(rect.width)
    const h = Math.round(rect.height)
    const sh = window.scrollY || window.pageYOffset || 0
    
    dom.style.left = `${ev.pageX - w / 2}px`
    dom.style.top = `${ev.pageY - sh - h}px`
    dom.style.opacity = '1'

    setTimeout(() => {
      dom.style.transition = `transform ${ANIMATION_DURATION}ms ease-out, opacity ${ANIMATION_DURATION}ms ease-out`
      dom.style.opacity = '0'
      dom.style.transform = 'translateY(-26px)'
    }, ANIMATION_DELAY)

    setTimeout(() => {
      dom.remove()
    }, ANIMATION_DURATION + ANIMATION_DELAY)
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
  
  const SHOW_THRESHOLD = 200
  let scrollTimeout
  
  const checkToShow = () => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
    scrollTop > SHOW_THRESHOLD ? blog.addClass(el, 'show') : blog.removeClass(el, 'show')
  }
  
  el.addEventListener('click', (event) => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    event.stopPropagation()
  }, true)
  
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout)
    scrollTimeout = requestAnimationFrame(checkToShow)
  }, { passive: true })
  
  checkToShow()
})

// 点击图片全屏预览
blog.addLoadEvent(() => {
  const postEl = document.querySelector('.page-post')
  if (!postEl) return
  
  console.debug('init post img click event')
  
  const IMG_SCALE = 0.9
  const ANIMATION_DURATION = 300
  
  let imgMoveOrigin = null
  let restoreLock = false
  const imgArr = document.querySelectorAll('.page-post img')

  const css = `
    .img-move-bg { z-index: 100; }
    .img-move-bg, .img-move-item { cursor: pointer; }
  `
  
  const styleDOM = document.createElement('style')
  styleDOM.textContent = css
  document.head.appendChild(styleDOM)

  const resizeObserver = new ResizeObserver(toCenter)
  
  imgArr.forEach(img => {
    img.addEventListener('click', imgClickEvent, true)
    resizeObserver.observe(window.visualViewport || window)
  })

  const prevent = (ev) => ev.preventDefault()

  function toCenter() {
    if (!imgMoveOrigin) return
    
    const maxWidth = window.innerWidth * IMG_SCALE
    const maxHeight = window.innerHeight * 0.95
    
    let width = Math.min(imgMoveOrigin.naturalWidth, maxWidth)
    let height = (width / imgMoveOrigin.naturalWidth) * imgMoveOrigin.naturalHeight
    
    if (height > maxHeight) {
      height = maxHeight
      width = (height / imgMoveOrigin.naturalHeight) * imgMoveOrigin.naturalWidth
    }

    const img = document.querySelector('.img-move-item')
    if (!img) return
    
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
    
    if (!div || !img) return

    div.style.opacity = '0'
    img.style.opacity = '0'
    img.style.left = `${imgMoveOrigin.x}px`
    img.style.top = `${imgMoveOrigin.y}px`
    img.style.width = `${imgMoveOrigin.width}px`
    img.style.height = `${imgMoveOrigin.height}px`

    setTimeout(() => {
      restoreLock = false
      div.remove?.() || document.body.removeChild(div)
      img.remove?.() || document.body.removeChild(img)
      imgMoveOrigin = null
    }, ANIMATION_DURATION)
  }

  function imgClickEvent(event) {
    if (imgMoveOrigin) return // 防止重复打开
    
    imgMoveOrigin = event.target
    const { x, y, width, height, src } = imgMoveOrigin

    const div = document.createElement('div')
    div.className = 'img-move-bg'
    div.style.cssText = `
      transition: opacity ${ANIMATION_DURATION}ms ease;
      position: fixed;
      left: 0; top: 0; right: 0; bottom: 0;
      opacity: 0;
      background-color: rgba(0, 0, 0, 0.5);
    `

    const img = document.createElement('img')
    img.className = 'img-move-item'
    img.src = src
    img.style.cssText = `
      transition: all ${ANIMATION_DURATION}ms ease;
      position: fixed;
      opacity: 0;
      left: ${x}px;
      top: ${y}px;
      width: ${width}px;
      height: ${height}px;
      z-index: 101;
    `

    const handleClose = (e) => {
      e.stopPropagation?.()
      restore()
    }
    
    div.addEventListener('click', handleClose)
    img.addEventListener('click', handleClose)
    img.addEventListener('wheel', handleClose)
    img.addEventListener('touchmove', prevent)
    img.addEventListener('dragstart', prevent)

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
  if (!themeBtn) return
  
  const themeIcon = themeBtn.querySelector('.svg-icon')
  const TRANSITION_DURATION = 600

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
    setTimeout(() => document.documentElement.removeAttribute('transition'), TRANSITION_DURATION)
    blog.initDarkMode(isDark ? 'true' : 'false')
  }

  themeBtn.addEventListener('click', () => {
    const flag = blog.darkMode ? 'false' : 'true'
    localStorage.darkMode = flag
    updateThemeIcon(flag === 'true')
  })

  // 检测系统主题明暗改变
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

// 为页面图片启用懒加载
// (降低native lazy loading支持)
blog.addLoadEvent(() => {
  try {
    const imgs = document.querySelectorAll('img')
    const logoImg = document.querySelector('.header .logo img')
    
    imgs.forEach(img => {
      if (!img.hasAttribute('loading') && img !== logoImg) {
        img.setAttribute('loading', 'lazy')
      }
    })
  } catch (e) {
    console.warn('init lazy loading images failed', e)
  }
})
