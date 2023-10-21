import React from 'react'

interface SectionContainerProps {
  title: string
  children: React.ReactNode
  style?: React.CSSProperties
}

export default function SectionContainer(props: SectionContainerProps) {
  return (
    <div style={{ border: '1px solid #222222', ...props.style }}>
      <div style={{ backgroundColor: '#222222', padding: '0px 6px 0px 6px' }}>{props.title}</div>
      <div style={{ padding: 6 }}>{props.children}</div>
    </div>
  )
}
