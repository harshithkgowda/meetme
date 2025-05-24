"use client"
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const ZegoRoom = dynamic(() => import('../../../_components/Zego/room'), { ssr: false })


export default function RoomPage() {
  return (
    <Suspense fallback={<div>Loading room...</div>}>
      <ZegoRoom />
    </Suspense>
  )
}
