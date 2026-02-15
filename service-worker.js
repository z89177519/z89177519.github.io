---
layout: null
---
let version = "{{site.time | date: "%Y%m%d%H%M%S"}}"
let baseUrl = '{{site.baseurl}}'

// let version = '001'
// let baseUrl = ''

let cachePrefix = 'blog_'
let cacheKey = cachePrefix + version

// 不设置skipWaiting，更新后进入waiting状态，仍旧是旧的service-worker生效，直到旧的不控制任何client，比如关闭浏览器，此时再打开页面才会生效
// 设置skipWaiting后，立即生效，这时候会出现一个页面由sw-v1控制，后面又变成sw-v2控制，自己的程序要处理好使用不同sw版本的情况
self.skipWaiting()

self.addEventListener('install', function (event) {
  console.log('serviceWorker install')
  event.waitUntil(
    (async () => {
      try {
        const response = await fetch(baseUrl + '/index.html')
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        
        const html = await response.text()
        const urls = new Set()
        
        // 匹配 href 和 src 属性
        const regex = /(href|src)="([^"]+)"/g
        let match
        
        while ((match = regex.exec(html)) !== null) {
          const url = match[2].replace(/#.*/, '') // 去除hash
          
          // 只缓存相对URL和同域名URL
          if (!url.startsWith('http') || url.startsWith(baseUrl)) {
            urls.add(url)
          }
        }
        
        const cache = await caches.open(cacheKey)
        await cache.addAll(Array.from(urls))
      } catch (error) {
        console.error('Service Worker install failed:', error)
      }
    })()
  )
})

// fetch根据的是cacheKey进行分组，无需等待event.waitUntil
self.addEventListener('activate', function (event) {
  console.log('serviceWorker activate')

  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys()
        await Promise.all(
          keys
            .filter(key => key.startsWith(cachePrefix) && key !== cacheKey)
            .map(key => caches.delete(key))
        )
      } catch (error) {
        console.error('Service Worker activate failed:', error)
      }
    })()
  )
})

self.addEventListener('fetch', function (event) {
  const url = new URL(event.request.url)
  
  // 只处理同源请求
  if (url.origin !== self.origin) {
    return
  }
  
  event.respondWith(
    (async () => {
      try {
        const cache = await caches.open(cacheKey)
        const cached = await cache.match(event.request)
        
        if (cached) {
          return cached
        }
        
        const response = await fetch(event.request)
        
        // 缓存成功的响应
        if (response.ok) {
          const clonedResponse = response.clone()
          cache.put(event.request, clonedResponse)
        }
        
        return response
      } catch (error) {
        console.error('Fetch failed:', error)
        // 返回缓存版本或离线页面
        return caches.match(event.request)
      }
    })()
  )
})
