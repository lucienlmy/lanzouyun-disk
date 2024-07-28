import React, {CSSProperties, PropsWithChildren} from 'react'
import './Bar.css'

export interface BarProps {
  style?: CSSProperties
}

export const MyBar: React.FC<PropsWithChildren<BarProps>> = props => {
  return (
    <div className='bar' style={props.style}>
      {props.children}
    </div>
  )
}
