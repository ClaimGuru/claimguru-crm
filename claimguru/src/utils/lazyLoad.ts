/**
 * Lazy Loading Utilities
 * Implements lazy loading for routes and components
 */

import { lazy, ComponentType, LazyExoticComponent } from 'react'

/**
 * Lazy load a component with retry logic
 */
export function lazyLoadWithRetry<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  retries = 3,
  interval = 1000
): LazyExoticComponent<T> {
  return lazy(() => {
    return new Promise<{ default: T }>((resolve, reject) => {
      const attemptImport = (retriesLeft: number) => {
        importFn()
          .then(resolve)
          .catch((error) => {
            if (retriesLeft === 0) {
              reject(error)
              return
            }
            
            console.log(`Retrying import... (${retriesLeft} attempts left)`)
            setTimeout(() => {
              attemptImport(retriesLeft - 1)
            }, interval)
          })
      }
      
      attemptImport(retries)
    })
  })
}

/**
 * Preload a lazy-loaded component
 */
export function preloadComponent<T extends ComponentType<any>>(
  LazyComponent: LazyExoticComponent<T>
): Promise<void> {
  // @ts-ignore - accessing _ctor for preloading
  return LazyComponent._init ? LazyComponent._init() : Promise.resolve()
}

/**
 * Image lazy loading utility
 */
export class ImageLazyLoader {
  private observer: IntersectionObserver | null = null
  
  constructor() {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement
              const src = img.dataset.src
              
              if (src) {
                img.src = src
                img.removeAttribute('data-src')
                this.observer?.unobserve(img)
              }
            }
          })
        },
        {
          rootMargin: '50px',
        }
      )
    }
  }
  
  observe(element: HTMLImageElement): void {
    if (this.observer) {
      this.observer.observe(element)
    }
  }
  
  unobserve(element: HTMLImageElement): void {
    if (this.observer) {
      this.observer.unobserve(element)
    }
  }
  
  disconnect(): void {
    if (this.observer) {
      this.observer.disconnect()
    }
  }
}

export const imageLazyLoader = new ImageLazyLoader()
