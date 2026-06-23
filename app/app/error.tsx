'use client'

import React from 'react'
import AppError from '../error'

type Props = { children: React.ReactNode }

export default function RouteError({ error, reset }: { error: Error; reset: () => void }) {
  return <AppError error={error} reset={reset} />
}
