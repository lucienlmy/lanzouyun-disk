import React, {useEffect, useRef, useState} from 'react'

interface BoxSize {
  width: number
  height: number
}

interface SizeBoxProps {
  children: (size: BoxSize) => React.ReactNode
}

export default function SizeBox(props: SizeBoxProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<BoxSize>({
    width: 0,
    height: 0,
  })

  // 监听尺寸变化
  useEffect(() => {
    if (!contentRef.current) return

    // 使用ResizeObserver监听尺寸变化
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const {width, height} = entry.contentRect
        if (!width || !height) return
        setSize({width, height})
      }
    })

    // 观察目标元素
    resizeObserver.observe(contentRef.current)

    // 初始测量
    if (contentRef.current) {
      const rect = contentRef.current.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      setSize({width: rect.width, height: rect.height})
    }

    // 清理函数
    return () => {
      resizeObserver.disconnect()
    }
  }, [])
  return (
    <div className='flex-1 h-full' ref={contentRef}>
      {props.children(size)}
    </div>
  )
}
