import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const roomId = searchParams.get('roomId')!
  const userID = searchParams.get('userID')!
  const userName = searchParams.get('userName')!

  const token = ZegoUIKitPrebuilt.generateKitTokenForTest(
    parseInt(process.env.ZEGOCLOUD_APPID!),
    process.env.ZEGOCLOUD_SERVER_SECRET!,
    roomId,
    userID,
    userName
  )

  return NextResponse.json({ token })
}
