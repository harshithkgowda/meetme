'use client'

import React, { useEffect, useRef } from 'react'
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt'
import { useParams } from 'next/navigation'

const getToken = (roomId: string, userID: string, userName: string) => {
  const appID = Number(1675447767)
  const serverSecret = "ae97857b44c83b478db2a7606081a5bc"
  return ZegoUIKitPrebuilt.generateKitTokenForTest(appID, serverSecret, roomId, userID, userName)
}

export default function ZegoRoom() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { roomId } = useParams()

  useEffect(() => {
    if (!roomId || Array.isArray(roomId)) return

    const kitToken = getToken(roomId, Date.now().toString(), 'User')
    const zp = ZegoUIKitPrebuilt.create(kitToken)

    zp.joinRoom({
      container: containerRef.current!,
      sharedLinks: [
        {
          name: 'Invite Link',
          url: `${window.location.origin}/room/${roomId}`,
        },
      ],
      scenario: {
        mode: ZegoUIKitPrebuilt.VideoConference,
      },
    })
  }, [roomId])

  return <div ref={containerRef} className="w-full h-screen" />
}
