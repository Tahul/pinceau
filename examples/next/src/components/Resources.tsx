import * as React from 'react'

export interface Resource {
  title: string
  href: string
  description: string
}

export const Resources: React.FC<{ resources: Resource[] }> = ({ resources }) => {
  return (
    <div>{
        resources.map(({ title, href, description }) => (<a
            key={href}
            href={href}
            target='_blank'
            rel='noopener noreferrer'
          >
            <h2>
              {title}
              <span />
            </h2>
            <p>
              {description}
            </p>
          </a>
        ))
      }
    </div>
  )
}
