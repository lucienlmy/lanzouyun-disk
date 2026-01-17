import React from 'react'
import './ScrollView.css'

export type ScrollViewProps = {
  HeaderComponent?: React.ReactNode
  FooterComponent?: React.ReactNode
  scroll?: boolean
} & JSX.IntrinsicElements['div']

// 外层需要 overflow: hidden
export const MyScrollView: React.FC<ScrollViewProps> = ({
  HeaderComponent,
  FooterComponent,
  className = '',
  ...props
}) => {
  return (
    <div className={`ScrollView ${className}`} {...props}>
      {HeaderComponent}
      <div className={`ScrollViewContent ${scroll ? 'overflow-y-scroll' : 'overflow-hidden'}`}>{props.children}</div>
      {FooterComponent}
    </div>
  )
}

MyScrollView.defaultProps = {
  scroll: true,
}
