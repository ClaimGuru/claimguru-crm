import React from 'react'

// Smooth fade in animation
export function FadeIn({ 
  children, 
  delay = 0, 
  duration = 300,
  className = '' 
}: { 
  children: React.ReactNode
  delay?: number
  duration?: number
  className?: string
}) {
  return (
    <div 
      className={`animate-fade-in ${className}`}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`,
        animationFillMode: 'both'
      }}
    >
      {children}
    </div>
  )
}

// Slide in from direction
export function SlideIn({ 
  children, 
  direction = 'up',
  delay = 0,
  duration = 300,
  distance = 20,
  className = '' 
}: { 
  children: React.ReactNode
  direction?: 'up' | 'down' | 'left' | 'right'
  delay?: number
  duration?: number
  distance?: number
  className?: string
}) {
  const animationClass = {
    up: 'animate-slide-in-up',
    down: 'animate-slide-in-down', 
    left: 'animate-slide-in-left',
    right: 'animate-slide-in-right'
  }[direction]
  
  return (
    <div 
      className={`${animationClass} ${className}`}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`
      }}
    >
      {children}
    </div>
  )
}

// Scale in animation
export function ScaleIn({ 
  children, 
  delay = 0,
  duration = 300,
  scale = 0.95,
  className = '' 
}: { 
  children: React.ReactNode
  delay?: number
  duration?: number
  scale?: number
  className?: string
}) {
  return (
    <div 
      className={`animate-scale-in ${className}`}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`
      }}
    >
      {children}
    </div>
  )
}

// Stagger children animations
export function StaggeredAnimation({ 
  children, 
  staggerDelay = 100,
  className = '' 
}: { 
  children: React.ReactNode[]
  staggerDelay?: number
  className?: string
}) {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <FadeIn key={index} delay={index * staggerDelay}>
          {child}
        </FadeIn>
      ))}
    </div>
  )
}

// Hover scale effect
export function HoverScale({ 
  children, 
  scale = 1.05,
  className = '' 
}: { 
  children: React.ReactNode
  scale?: number
  className?: string
}) {
  return (
    <div 
      className={`transition-transform duration-200 ease-out hover:scale-${Math.round(scale * 100)} ${className}`}
    >
      {children}
    </div>
  )
}

// Bounce attention animation
export function BounceAttention({ 
  children, 
  trigger = false,
  className = '' 
}: { 
  children: React.ReactNode
  trigger?: boolean
  className?: string
}) {
  return (
    <div className={`${trigger ? 'animate-bounce' : ''} ${className}`}>
      {children}
    </div>
  )
}

// Loading pulse animation
export function PulseLoader({ 
  size = 'md',
  color = 'blue',
  className = '' 
}: { 
  size?: 'sm' | 'md' | 'lg'
  color?: 'blue' | 'gray' | 'green' | 'red'
  className?: string
}) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  }
  
  const colorClasses = {
    blue: 'bg-blue-600',
    gray: 'bg-gray-600',
    green: 'bg-green-600',
    red: 'bg-red-600'
  }
  
  return (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-pulse`}
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  )
}

// Page transition wrapper
export function PageTransition({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode
  className?: string
}) {
  return (
    <FadeIn duration={200} className={className}>
      {children}
    </FadeIn>
  )
}

// Mobile-optimized touch animations
export function TouchableScale({ 
  children, 
  scale = 0.98,
  className = '' 
}: { 
  children: React.ReactNode
  scale?: number
  className?: string
}) {
  return (
    <div 
      className={`transition-transform duration-100 ease-out active:scale-${Math.round(scale * 100)} ${className}`}
    >
      {children}
    </div>
  )
}

export default {
  FadeIn,
  SlideIn,
  ScaleIn,
  StaggeredAnimation,
  HoverScale,
  BounceAttention,
  PulseLoader,
  PageTransition,
  TouchableScale
}